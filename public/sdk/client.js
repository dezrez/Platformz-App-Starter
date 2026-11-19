import { demoError, envelope, exactOrigin, isEnvelope, requestId } from './protocol.js';
import { normalizeActionState, validActionResult } from './dialog.js';

/**
 * Create a framework-independent client bound to one exact host window/origin.
 * @param {{hostOrigin:string,hostWindow?:Window,eventTarget?:Window,timeoutMs?:number}} options
 */
export function createPartnerClient({ hostOrigin, hostWindow = globalThis.parent, eventTarget = globalThis.window, timeoutMs = 5000 }) {
  if (!exactOrigin(hostOrigin)) throw new TypeError('An exact HTTP(S) host origin is required.');
  if (!hostWindow?.postMessage || !eventTarget?.addEventListener) throw new TypeError('A host window and event target are required.');
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1) throw new TypeError('A positive request timeout is required.');
  let sessionId = null;
  let connecting = null;
  let connected = false;
  let destroyed = false;
  let enabled = true;
  let dialogActions = false;
  let pendingActionId = null;
  let lastActionState = null;
  let surface = 'property-action';
  const actionIds = new Set();
  const pending = new Map();
  const listeners = new Map();
  const send = (type, id, payload = {}) => hostWindow.postMessage(envelope(type, sessionId, id, payload), hostOrigin);
  const emit = (type, payload) => {
    for (const callback of listeners.get(type) ?? []) callback(payload);
  };
  function finish(id, error, result) {
    const entry = pending.get(id);
    if (!entry) return;
    pending.delete(id);
    clearTimeout(entry.timer);
    entry.cleanup?.();
    if (error) entry.reject(error); else entry.resolve(result);
  }
  function rejectPending(code, message) {
    for (const id of [...pending.keys()]) finish(id, demoError(code, message, 409));
  }
  function receive(event) {
    if (destroyed || event.source !== hostWindow || event.origin !== hostOrigin || !isEnvelope(event.data)) return;
    const message = event.data;
    if (message.type === 'partner.init') {
      const widget = message.payload.surface === 'dashboard-widget' && message.payload.context === null && message.payload.synthetic === true && message.payload.manifest?.surface === 'dashboard-widget' && Array.isArray(message.payload.permissions) && message.payload.permissions.length === 0 && Array.isArray(message.payload.manifest.permissions) && message.payload.manifest.permissions.length === 0;
      const property = (message.payload.surface === undefined || message.payload.surface === 'property-action') && message.payload.context?.id && message.payload.context?.agencyId;
      if (!connecting || message.requestId !== connecting.id || typeof message.payload.synthetic !== 'boolean' || !widget && !property) return;
      sessionId = message.sessionId;
      surface = widget ? 'dashboard-widget' : 'property-action';
      enabled = message.payload.enabled !== false;
      dialogActions = !widget && message.payload.capabilities?.dialogActions === true;
      pendingActionId = null;
      lastActionState = null;
      actionIds.clear();
      connected = true;
      clearTimeout(connecting.timer);
      const resolve = connecting.resolve;
      connecting = null;
      resolve(message.payload);
      emit('partner.init', message.payload);
      return;
    }
    if (!connected) return;
    if (message.type === 'partner.context') {
      if (message.sessionId === sessionId) return;
      if (surface === 'dashboard-widget') {
        if (message.payload.context !== null || message.payload.surface !== 'dashboard-widget' || !Array.isArray(message.payload.permissions) || message.payload.permissions.length !== 0 || Object.keys(message.payload).some(key => !['context', 'surface', 'permissions'].includes(key))) return;
      } else if (!message.payload.id || !message.payload.agencyId || message.payload.surface === 'dashboard-widget') return;
      rejectPending('CONTEXT_CHANGED', 'The host context changed.');
      sessionId = message.sessionId;
      pendingActionId = null;
      lastActionState = null;
      actionIds.clear();
      emit(message.type, surface === 'dashboard-widget' ? null : message.payload);
      return;
    }
    if (message.sessionId !== sessionId) return;
    if (message.type === 'partner.result') finish(message.requestId, null, message.payload.result);
    else if (message.type === 'partner.error') finish(message.requestId, demoError(message.payload.code ?? 'HOST_ERROR', message.payload.message ?? 'The host rejected the request.', message.payload.status ?? 400));
    else if (message.type === 'partner.enabled') {
      enabled = message.payload.enabled === true;
      if (!enabled) { pendingActionId = null; lastActionState = null; rejectPending('HOST_DISABLED', 'The host disabled this app.'); }
      emit(message.type, message.payload);
    } else if (message.type === 'partner.closed') {
      connected = false;
      pendingActionId = null;
      rejectPending('HOST_CLOSED', 'The host closed this app.');
      emit(message.type, message.payload);
    } else if (message.type === 'partner.action') {
      if (surface === 'dashboard-widget') return;
      if (dialogActions) {
        if (!enabled || pendingActionId || message.payload.action !== 'save' || !/^[A-Za-z0-9_-]{1,100}$/.test(message.payload.actionId ?? '') || actionIds.has(message.payload.actionId) || actionIds.size >= 128) return;
        actionIds.add(message.payload.actionId);
        pendingActionId = message.payload.actionId;
      }
      emit(message.type, message.payload);
    } else if (message.type === 'partner.theme') emit(message.type, message.payload);
  }
  eventTarget.addEventListener('message', receive);
  return {
    connect() {
      if (destroyed) return Promise.reject(demoError('CLIENT_DESTROYED', 'The client has been destroyed.'));
      if (connected) return Promise.reject(demoError('ALREADY_CONNECTED', 'This client is already connected.'));
      if (connecting) return connecting.promise;
      const id = requestId();
      const promise = new Promise((resolve, reject) => {
        connecting = { id, resolve, reject, timer: setTimeout(() => {
          connecting = null;
          reject(demoError('HANDSHAKE_TIMEOUT', 'The Dezrez host did not respond.', 408));
        }, timeoutMs) };
      });
      connecting.promise = promise;
      hostWindow.postMessage(envelope('partner.hello', null, id, { sdkVersion: '0.1.0' }), hostOrigin);
      return promise;
    },
    request(operation, params = {}, { signal } = {}) {
      if (destroyed || !connected) return Promise.reject(demoError('NOT_CONNECTED', 'Connect to the Dezrez host first.', 409));
      if (surface === 'dashboard-widget') return Promise.reject(demoError('CONTEXT_REQUIRED', 'Choose a record context before using a record operation.', 409));
      if (!enabled) return Promise.reject(demoError('HOST_DISABLED', 'The host disabled this app.', 403));
      if (signal?.aborted) return Promise.reject(demoError('CANCELLED', 'The request was cancelled.', 499));
      if (pending.size >= 16) return Promise.reject(demoError('TOO_MANY_PENDING', 'Wait for an existing request before sending another.', 429));
      const id = requestId();
      return new Promise((resolve, reject) => {
        const abort = () => { send('partner.cancel', id); finish(id, demoError('CANCELLED', 'The request was cancelled.', 499)); };
        const entry = { resolve, reject, timer: setTimeout(() => {
          send('partner.cancel', id);
          finish(id, demoError('REQUEST_TIMEOUT', 'The request timed out.', 408));
        }, timeoutMs), cleanup: () => signal?.removeEventListener('abort', abort) };
        pending.set(id, entry);
        signal?.addEventListener('abort', abort, { once: true });
        try { send('partner.request', id, { operation, params }); }
        catch { finish(id, demoError('INVALID_REQUEST', 'The request could not be sent.')); }
      });
    },
    on(type, callback) {
      const name = type.startsWith('partner.') ? type : `partner.${type}`;
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
      return () => listeners.get(name)?.delete(callback);
    },
    setActionState(value) {
      if (destroyed || !connected || !dialogActions) return false;
      const update = normalizeActionState(value);
      const encoded = JSON.stringify(update);
      if (encoded === lastActionState) return true;
      send('partner.actionState', requestId(), update);
      lastActionState = encoded;
      return true;
    },
    completeAction(actionId, result) {
      if (destroyed || !connected || !enabled || !dialogActions || actionId !== pendingActionId || !result || Object.getPrototypeOf(result) !== Object.prototype || Object.keys(result).length !== 1 || !Object.hasOwn(result, 'success')) return false;
      const payload = { actionId, success: result.success };
      if (!validActionResult(payload)) throw new TypeError('An action completion requires a boolean success.');
      if (payload.success && pending.size > 0) return false;
      send('partner.actionResult', requestId(), payload);
      pendingActionId = null;
      return true;
    },
    destroy() {
      if (destroyed) return;
      for (const id of pending.keys()) send('partner.cancel', id);
      rejectPending('CLIENT_DESTROYED', 'The client has been destroyed.');
      if (connecting) {
        clearTimeout(connecting.timer);
        connecting.reject(demoError('CLIENT_DESTROYED', 'The client has been destroyed.'));
        connecting = null;
      }
      destroyed = true;
      connected = false;
      pendingActionId = null;
      dialogActions = false;
      listeners.clear();
      eventTarget.removeEventListener('message', receive);
    },
    get sessionId() { return sessionId; },
  };
}
