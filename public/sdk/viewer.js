import { exactOrigin, requestId } from './protocol.js';

// Independent, read-only capability. This never grants record operations or
// transfers credentials. Hosts without this extension fail closed.
export const VIEWER_PROTOCOL = 'dezrez.viewer/1';
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const keys = (value, names) => plain(value) && Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name));
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
const messages = {
  VIEWER_NOT_READY: 'Connect your app to the developer website first.',
  VIEWER_SIGN_IN_REQUIRED: 'Sign in to the developer website, then reconnect your app.',
  VIEWER_UNAVAILABLE: 'Your name could not be loaded. Reconnect your app to try again.',
  VIEWER_CLOSED: 'This app connection has ended.',
  VIEWER_DISABLED: 'This app is paused.',
  VIEWER_LIMIT: 'Please wait before trying again.',
};
const failure = code => Object.assign(new Error(messages[code] ?? messages.VIEWER_UNAVAILABLE), { code: Object.hasOwn(messages, code) ? code : 'VIEWER_UNAVAILABLE' });
const packet = (type, sessionId, id, payload) => ({ protocol: VIEWER_PROTOCOL, type, sessionId, requestId: id, payload });
function validPacket(value) {
  return keys(value, ['protocol', 'type', 'sessionId', 'requestId', 'payload']) && value.protocol === VIEWER_PROTOCOL
    && ['get', 'result', 'error'].includes(value.type) && identifier(value.sessionId) && identifier(value.requestId) && plain(value.payload)
    && (value.type === 'get' ? keys(value.payload, []) : value.type === 'result' ? validViewer(value.payload) : keys(value.payload, ['code']) && Object.hasOwn(messages, value.payload.code));
}
function validViewer(value) {
  return keys(value, ['firstName']) && (value.firstName === null || typeof value.firstName === 'string' && value.firstName.trim() === value.firstName
    && [...value.firstName].length > 0 && [...value.firstName].length <= 60 && !/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/u.test(value.firstName));
}

/** Create before client.connect(); destroy before the core client. */
export function createViewerClient({ client, hostOrigin, hostWindow = globalThis.parent, eventTarget = globalThis.window, timeoutMs = 5000 }) {
  if (!client?.on || !exactOrigin(hostOrigin) || !hostWindow?.postMessage || !eventTarget?.addEventListener || !eventTarget?.removeEventListener
    || !Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) throw new TypeError('Use the current client and exact host window and origin.');
  let connected = false, enabled = true, destroyed = false, sessionId = null, pending = null;
  function finish(error, value) {
    if (!pending) return;
    const entry = pending; pending = null; clearTimeout(entry.timer);
    if (error) entry.reject(error); else entry.resolve(value);
  }
  const subscriptions = [
    client.on('partner.init', value => { finish(failure('VIEWER_CLOSED')); sessionId = client.sessionId; connected = true; enabled = value.enabled !== false; }),
    client.on('partner.context', () => { finish(failure('VIEWER_CLOSED')); sessionId = client.sessionId; }),
    client.on('partner.closed', () => { connected = false; finish(failure('VIEWER_CLOSED')); }),
    client.on('partner.enabled', value => { enabled = value.enabled === true; if (!enabled) finish(failure('VIEWER_DISABLED')); }),
  ];
  function receive(event) {
    if (destroyed || event.source !== hostWindow || event.origin !== hostOrigin || !validPacket(event.data) || !pending
      || event.data.sessionId !== sessionId || client.sessionId !== sessionId || event.data.requestId !== pending.id) return;
    if (event.data.type === 'result') finish(null, { firstName: event.data.payload.firstName });
    else if (event.data.type === 'error') finish(failure(event.data.payload.code));
  }
  eventTarget.addEventListener('message', receive);
  return {
    getCurrentViewer() {
      if (destroyed || !connected || client.sessionId !== sessionId) return Promise.reject(failure('VIEWER_NOT_READY'));
      if (!enabled) return Promise.reject(failure('VIEWER_DISABLED'));
      if (pending) return pending.promise;
      const id = requestId();
      const promise = new Promise((resolve, reject) => { pending = { id, resolve, reject, timer: setTimeout(() => finish(failure('VIEWER_UNAVAILABLE')), timeoutMs) }; });
      pending.promise = promise;
      try { hostWindow.postMessage(packet('get', sessionId, id, {}), hostOrigin); }
      catch { finish(failure('VIEWER_UNAVAILABLE')); }
      return promise;
    },
    destroy() { if (destroyed) return; destroyed = true; connected = false; finish(failure('VIEWER_CLOSED')); subscriptions.forEach(unsubscribe => unsubscribe()); eventTarget.removeEventListener('message', receive); },
  };
}

/** Parent-only adapter: readViewer calls the authenticated same-origin API. */
export function createViewerHost({ targetWindow, targetOrigin, eventTarget = globalThis.window, session, readViewer }) {
  if (!targetWindow?.postMessage || !exactOrigin(targetOrigin) || !eventTarget?.addEventListener || !eventTarget?.removeEventListener || typeof session !== 'function' || typeof readViewer !== 'function') throw new TypeError('Use an exact app window, origin and authenticated viewer adapter.');
  let disposed = false, pending = null, pendingSession = null, count = 0;
  const seen = new Set();
  const send = (message, type, payload) => targetWindow.postMessage(packet(type, message.sessionId, message.requestId, payload), targetOrigin);
  async function receive(event) {
    const message = event.data;
    if (disposed || event.source !== targetWindow || event.origin !== targetOrigin || !validPacket(message) || message.type !== 'get') return;
    const initial = session();
    if (!initial?.connected || initial.id !== message.sessionId || !initial.enabled || seen.has(message.requestId)) return;
    if (!initial.authenticated) { send(message, 'error', { code: 'VIEWER_SIGN_IN_REQUIRED' }); return; }
    if (pending || count >= 64) { send(message, 'error', { code: 'VIEWER_LIMIT' }); return; }
    seen.add(message.requestId); count++;
    const controller = new AbortController(); pending = controller; pendingSession = initial;
    try {
      const value = await readViewer({ signal: controller.signal });
      const current = session();
      if (disposed || controller.signal.aborted || !current?.connected || !current.enabled || current.id !== initial.id) return;
      if (!current.authenticated || current.identityKey !== initial.identityKey) { send(message, 'error', { code: 'VIEWER_SIGN_IN_REQUIRED' }); return; }
      if (!validViewer(value)) throw failure('VIEWER_UNAVAILABLE');
      send(message, 'result', { firstName: value.firstName });
    } catch (error) {
      const current = session();
      if (!disposed && !controller.signal.aborted && current?.connected && current.enabled && current.id === initial.id) send(message, 'error', { code: error?.status === 401 || !current.authenticated || current.identityKey !== initial.identityKey ? 'VIEWER_SIGN_IN_REQUIRED' : 'VIEWER_UNAVAILABLE' });
    } finally { if (pending === controller) { pending = null; pendingSession = null; } }
  }
  eventTarget.addEventListener('message', receive);
  return {
    sync() {
      if (!pending) return;
      const current = session();
      if (!current?.connected || !current.enabled || !current.authenticated || current.id !== pendingSession.id || current.identityKey !== pendingSession.identityKey) {
        pending.abort(); pending = null; pendingSession = null;
      }
    },
    dispose() { if (disposed) return; disposed = true; pending?.abort(); pending = null; pendingSession = null; seen.clear(); eventTarget.removeEventListener('message', receive); },
  };
}
