import { exactOrigin, requestId } from './protocol.js';

// Optional, independent channel. It never enables core record operations or
// falls back to a legacy credential/API handoff when a host lacks this feature.
export const WIDGET_SETTINGS_PROTOCOL = 'dezrez.widget-settings/1';
const maximumBytes = 16_384, maximumDepth = 12, maximumPending = 16, maximumRequests = 128;
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
const plain = value => value !== null && typeof value === 'object' && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const keysAre = (value, names) => plain(value) && Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name));
const messages = Object.freeze({
  WIDGET_SETTINGS_NOT_READY: 'Connect the widget before using its settings.',
  WIDGET_SETTINGS_UNSUPPORTED: 'This host does not provide widget settings.',
  WIDGET_SETTINGS_INVALID: 'Use a plain settings object within the supported size and depth.',
  WIDGET_SETTINGS_TIMEOUT: 'The widget settings response was not received. Check the result before trying again.',
  WIDGET_SETTINGS_DISABLED: 'The host has paused this widget.',
  WIDGET_SETTINGS_CLOSED: 'The host has closed this widget.',
  WIDGET_SETTINGS_CONTEXT_CHANGED: 'The widget preview changed. Open its settings again.',
  WIDGET_SETTINGS_LIMIT: 'Wait for an existing settings request before trying again.',
  WIDGET_SETTINGS_FAILED: 'The widget settings could not be completed.',
  WIDGET_SETTINGS_DISPOSED: 'The widget settings connection has ended.',
});
function error(code) {
  const known = typeof code === 'string' && Object.hasOwn(messages, code) ? code : 'WIDGET_SETTINGS_FAILED';
  return Object.assign(new Error(messages[known]), { name: 'WidgetSettingsError', code: known });
}
function duration(value) { if (!Number.isFinite(value) || value < 1 || value > 60_000) throw new TypeError('Use a settings timeout between 1 and 60000 milliseconds.'); return value; }

/** JSON only, without invoking getters, toJSON methods, or mutable shared data. */
function copySettings(value, nullable = false) {
  if (nullable && value === null) return null;
  if (!plain(value)) throw error('WIDGET_SETTINGS_INVALID');
  const ancestors = new Set(); let nodes = 0;
  function inspect(item, depth) {
    if (++nodes > maximumBytes || depth > maximumDepth) throw error('WIDGET_SETTINGS_INVALID');
    if (item === null || typeof item === 'boolean' || typeof item === 'string') return;
    if (typeof item === 'number') { if (!Number.isFinite(item)) throw error('WIDGET_SETTINGS_INVALID'); return; }
    if (!Array.isArray(item) && !plain(item) || ancestors.has(item)) throw error('WIDGET_SETTINGS_INVALID');
    const descriptors = Object.getOwnPropertyDescriptors(item), names = Reflect.ownKeys(descriptors);
    if (names.some(name => typeof name !== 'string') || names.length > maximumBytes) throw error('WIDGET_SETTINGS_INVALID');
    if (Array.isArray(item) && (item.length > maximumBytes || names.length !== item.length + 1)) throw error('WIDGET_SETTINGS_INVALID');
    ancestors.add(item);
    for (const name of names) {
      if (Array.isArray(item) && name === 'length') continue;
      const property = descriptors[name];
      if (!Object.hasOwn(property, 'value') || !property.enumerable || Array.isArray(item) && !/^(?:0|[1-9]\d*)$/.test(name)) throw error('WIDGET_SETTINGS_INVALID');
      inspect(property.value, depth + 1);
    }
    ancestors.delete(item);
  }
  inspect(value, 0);
  const text = JSON.stringify(value);
  if (new TextEncoder().encode(text).length > maximumBytes) throw error('WIDGET_SETTINGS_INVALID');
  return JSON.parse(text);
}
const packet = (type, sessionId, id, payload) => ({ protocol: WIDGET_SETTINGS_PROTOCOL, type, sessionId, requestId: id, payload });
function validPacket(value) {
  if (!keysAre(value, ['protocol', 'type', 'sessionId', 'requestId', 'payload']) || value.protocol !== WIDGET_SETTINGS_PROTOCOL
    || !['hello', 'ready', 'get', 'save', 'result', 'error', 'dispose'].includes(value.type) || !identifier(value.sessionId) || !identifier(value.requestId) || !plain(value.payload)) return false;
  try { return new TextEncoder().encode(JSON.stringify(value)).length <= maximumBytes + 1024; } catch { return false; }
}

/** Create before core client.connect(); dispose this facade before the core client. */
export function createWidgetSettingsClient({ client, hostOrigin, hostWindow = globalThis.parent, eventTarget = globalThis.window, timeoutMs = 5000 }) {
  duration(timeoutMs);
  if (!client || typeof client.on !== 'function' || !exactOrigin(hostOrigin) || !hostWindow?.postMessage || !eventTarget?.addEventListener || !eventTarget?.removeEventListener) throw new TypeError('Use the current core client and its exact host window and origin.');
  let metadata = null, disposed = false, ready = false, generation = 0, hello = null, advertisedSetup = null;
  const pending = new Map(), openListeners = new Set();
  const send = (type, id, payload) => hostWindow.postMessage(packet(type, metadata.id, id, payload), hostOrigin);
  function finish(id, failure, value) {
    const entry = pending.get(id); if (!entry) return;
    pending.delete(id); clearTimeout(entry.timer);
    if (failure) entry.reject(failure); else entry.resolve(value);
  }
  function invalidate(code) {
    generation++; ready = false; advertisedSetup = null;
    if (hello) { const previous = hello; hello = null; clearTimeout(previous.timer); previous.reject(error(code)); }
    for (const id of [...pending.keys()]) finish(id, error(code));
  }
  function activeError() {
    if (disposed) return error('WIDGET_SETTINGS_DISPOSED');
    if (!metadata) return error('WIDGET_SETTINGS_NOT_READY');
    if (client.sessionId !== metadata.id) { invalidate('WIDGET_SETTINGS_CONTEXT_CHANGED'); metadata = null; return error('WIDGET_SETTINGS_CONTEXT_CHANGED'); }
    if (!metadata.connected) return error('WIDGET_SETTINGS_CLOSED');
    if (metadata.surface !== 'dashboard-widget') return error('WIDGET_SETTINGS_UNSUPPORTED');
    if (!metadata.enabled) return error('WIDGET_SETTINGS_DISABLED');
    return null;
  }
  function negotiate() {
    const failure = activeError(); if (failure) return Promise.reject(failure);
    if (hello) return hello.promise;
    if (ready && advertisedSetup === (openListeners.size > 0)) return Promise.resolve();
    const id = requestId(), epoch = generation, hasSetup = openListeners.size > 0;
    const promise = new Promise((resolve, reject) => {
      hello = { id, epoch, hasSetup, resolve, reject, timer: setTimeout(() => {
        if (hello?.id !== id) return;
        hello = null; ready = false; reject(error('WIDGET_SETTINGS_UNSUPPORTED'));
      }, timeoutMs) };
    });
    hello.promise = promise;
    try { send('hello', id, { hasSetup }); }
    catch { const previous = hello; hello = null; clearTimeout(previous.timer); previous.reject(error('WIDGET_SETTINGS_FAILED')); }
    return promise;
  }
  const advertise = () => { void negotiate().catch(() => {}); };
  const subscriptions = [
    client.on('partner.init', value => {
      invalidate('WIDGET_SETTINGS_CONTEXT_CHANGED');
      metadata = { id: client.sessionId, surface: value.surface ?? value.manifest?.surface, connected: true, enabled: value.enabled !== false };
      if (metadata.surface === 'dashboard-widget' && metadata.enabled) advertise();
    }),
    client.on('partner.context', () => {
      if (!metadata) return;
      invalidate('WIDGET_SETTINGS_CONTEXT_CHANGED'); metadata.id = client.sessionId;
      if (metadata.surface === 'dashboard-widget' && metadata.enabled && metadata.connected) advertise();
    }),
    client.on('partner.enabled', value => {
      if (!metadata) return;
      metadata.enabled = value.enabled === true;
      if (!metadata.enabled) {
        ready = false; advertisedSetup = null;
        if (hello) { const previous = hello; hello = null; clearTimeout(previous.timer); previous.reject(error('WIDGET_SETTINGS_DISABLED')); }
        for (const id of [...pending.keys()]) finish(id, error('WIDGET_SETTINGS_DISABLED'));
      } else if (metadata.connected && metadata.surface === 'dashboard-widget') advertise();
    }),
    client.on('partner.closed', () => { if (metadata) metadata.connected = false; invalidate('WIDGET_SETTINGS_CLOSED'); }),
  ];
  function receive(event) {
    if (disposed || event.source !== hostWindow || event.origin !== hostOrigin || activeError()) return;
    const value = event.data;
    // This exact UI-only command is also used by the existing Dezrez widget host.
    if (keysAre(value, ['messageType']) && value.messageType === 'settings') {
      if (ready) for (const callback of openListeners) { try { callback(); } catch { /* An app callback cannot break the transport. */ } }
      return;
    }
    if (!validPacket(value) || value.sessionId !== metadata.id) return;
    if (hello?.id === value.requestId && hello.epoch === generation) {
      if (value.type !== 'ready' && value.type !== 'error') return;
      if (value.type === 'error' && (!keysAre(value.payload, ['code']) || typeof value.payload.code !== 'string')) return;
      const previous = hello; hello = null; clearTimeout(previous.timer);
      if (value.type === 'ready' && keysAre(value.payload, ['available']) && value.payload.available === true) {
        ready = true; advertisedSetup = previous.hasSetup; previous.resolve();
        if (advertisedSetup !== (openListeners.size > 0)) advertise();
      } else { ready = false; previous.reject(error(value.type === 'error' ? value.payload.code : 'WIDGET_SETTINGS_UNSUPPORTED')); }
      return;
    }
    const entry = pending.get(value.requestId);
    if (!entry || entry.epoch !== generation) return;
    if (value.type === 'error' && keysAre(value.payload, ['code'])) finish(value.requestId, error(value.payload.code));
    else if (value.type === 'result' && keysAre(value.payload, ['settings'])) {
      try { finish(value.requestId, null, copySettings(value.payload.settings, true)); }
      catch { finish(value.requestId, error('WIDGET_SETTINGS_INVALID')); }
    }
  }
  eventTarget.addEventListener('message', receive);
  async function request(type, payload) {
    let failure = activeError(); if (failure) throw failure;
    const epoch = generation;
    await negotiate();
    failure = activeError(); if (failure) throw failure;
    if (epoch !== generation) throw error('WIDGET_SETTINGS_CONTEXT_CHANGED');
    if (pending.size >= maximumPending) throw error('WIDGET_SETTINGS_LIMIT');
    const id = requestId();
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject, epoch, timer: setTimeout(() => finish(id, error('WIDGET_SETTINGS_TIMEOUT')), timeoutMs) });
      try { send(type, id, payload); } catch { finish(id, error('WIDGET_SETTINGS_FAILED')); }
    });
  }
  return {
    get: () => request('get', {}),
    async save(settings) { return request('save', { settings: copySettings(settings) }); },
    onOpen(callback) {
      if (disposed) throw error('WIDGET_SETTINGS_DISPOSED');
      if (typeof callback !== 'function') throw new TypeError('Use a settings-open callback.');
      openListeners.add(callback); if (metadata) advertise();
      return () => { if (openListeners.delete(callback) && metadata && !disposed) advertise(); };
    },
    dispose() {
      if (disposed) return;
      // Notify only the current paired widget. This invalidates host-side queued
      // work too; it never clears settings already committed by the adapter.
      if (metadata?.connected && metadata.surface === 'dashboard-widget' && identifier(metadata.id) && client.sessionId === metadata.id) {
        try { send('dispose', requestId(), {}); } catch { /* A detached host has no recipient. */ }
      }
      disposed = true; invalidate('WIDGET_SETTINGS_DISPOSED'); openListeners.clear();
      for (const unsubscribe of subscriptions) unsubscribe();
      eventTarget.removeEventListener('message', receive);
    },
  };
}

/** The trusted host supplies the namespace/storage adapter, never the widget. */
export function createWidgetSettingsHost({ targetWindow, targetOrigin, eventTarget = globalThis.window, session, adapter, onAvailability = () => {} }) {
  if (!exactOrigin(targetOrigin) || !targetWindow?.postMessage || !eventTarget?.addEventListener || !eventTarget?.removeEventListener || typeof session !== 'function' || typeof adapter?.get !== 'function' || typeof adapter?.save !== 'function' || typeof onAvailability !== 'function') throw new TypeError('Use the exact widget frame, trusted session and settings adapter.');
  let disposed = false, binding = null, negotiated = false, hasSetup = false, generation = 0, queue = Promise.resolve(), lastAvailability = '';
  const seen = new Set(), queued = new Set();
  const send = (type, id, payload, sessionId = binding?.id) => targetWindow.postMessage(packet(type, sessionId, id, payload), targetOrigin);
  function sync() {
    let next;
    try { next = session(); } catch { next = null; }
    const current = next && identifier(next.id) ? { id: next.id, surface: next.surface, connected: next.connected === true, enabled: next.enabled === true } : null;
    const disabled = binding?.enabled === true && current?.enabled !== true;
    if (disposed || current?.id !== binding?.id || !current?.connected || current?.surface !== 'dashboard-widget' || disabled) {
      if (negotiated || current?.id !== binding?.id || binding?.connected && !current?.connected || disabled) generation++;
      negotiated = false; hasSetup = false; seen.clear();
    }
    binding = current;
    const availability = { hasSetup: !disposed && negotiated && hasSetup, ready: !disposed && negotiated && current?.surface === 'dashboard-widget' && current?.connected === true && current?.enabled === true };
    const encoded = JSON.stringify(availability);
    if (encoded !== lastAvailability) { lastAvailability = encoded; try { onAvailability({ ...availability }); } catch { /* Host UI callbacks do not grant access. */ } }
    return availability;
  }
  function current(epoch, id) { const availability = sync(); return epoch === generation && binding?.id === id && availability.ready; }
  function reject(id, code, sessionId = binding?.id) { try { send('error', id, { code }, sessionId); } catch { /* A detached widget has no recipient. */ } }
  function receive(event) {
    if (disposed || event.source !== targetWindow || event.origin !== targetOrigin || !validPacket(event.data)) return;
    const value = event.data; sync();
    if (value.sessionId !== binding?.id || !binding?.connected) return;
    if (seen.has(value.requestId)) return;
    // Disposal must remain possible after the ordinary request bound is reached.
    // Keep its ID as a tombstone so replay cannot close a later negotiation.
    if (value.type === 'dispose') {
      if (binding.surface !== 'dashboard-widget' || !negotiated || !keysAre(value.payload, [])) return;
      seen.add(value.requestId); generation++; negotiated = false; hasSetup = false; sync();
      return;
    }
    if (seen.size >= maximumRequests) { reject(value.requestId, 'WIDGET_SETTINGS_LIMIT'); return; }
    seen.add(value.requestId);
    if (binding.surface !== 'dashboard-widget') { reject(value.requestId, 'WIDGET_SETTINGS_UNSUPPORTED'); return; }
    if (!binding.enabled) { reject(value.requestId, 'WIDGET_SETTINGS_DISABLED'); return; }
    if (value.type === 'hello') {
      if (!keysAre(value.payload, ['hasSetup']) || typeof value.payload.hasSetup !== 'boolean') { reject(value.requestId, 'WIDGET_SETTINGS_INVALID'); return; }
      negotiated = true; hasSetup = value.payload.hasSetup; sync();
      try { send('ready', value.requestId, { available: true }); } catch { /* The client retains its bounded timeout. */ }
      return;
    }
    if (value.type !== 'get' && value.type !== 'save') return;
    if (!negotiated) { reject(value.requestId, 'WIDGET_SETTINGS_UNSUPPORTED'); return; }
    let settings;
    try {
      if (value.type === 'get' ? !keysAre(value.payload, []) : !keysAre(value.payload, ['settings'])) throw error('WIDGET_SETTINGS_INVALID');
      if (value.type === 'save') settings = copySettings(value.payload.settings);
    } catch { reject(value.requestId, 'WIDGET_SETTINGS_INVALID'); return; }
    if (queued.size >= maximumPending) { reject(value.requestId, 'WIDGET_SETTINGS_LIMIT'); return; }
    const epoch = generation, id = binding.id, token = {}; queued.add(token);
    queue = queue.then(async () => {
      if (!current(epoch, id)) return;
      const result = await (value.type === 'get' ? adapter.get() : adapter.save(settings));
      if (!current(epoch, id)) return;
      const copied = copySettings(result, true);
      send('result', value.requestId, { settings: copied }, id);
    }).catch(() => { if (current(epoch, id)) reject(value.requestId, 'WIDGET_SETTINGS_FAILED', id); }).finally(() => { queued.delete(token); });
  }
  eventTarget.addEventListener('message', receive); sync();
  return {
    sync,
    openSettings() {
      const availability = sync(); if (!availability.ready || !availability.hasSetup) return false;
      try { targetWindow.postMessage({ messageType: 'settings' }, targetOrigin); return true; } catch { return false; }
    },
    dispose() {
      if (disposed) return;
      disposed = true; generation++; negotiated = false; hasSetup = false;
      eventTarget.removeEventListener('message', receive); sync();
    },
  };
}
