import { exactOrigin, requestId } from './protocol.js';

/** Independent full-API transport; it never requests or transfers sign-in tokens. */
export const API_PROTOCOL = 'dezrez.api/1';
export const API_MAX_REQUEST_BYTES = 8 * 1024 * 1024;
export const API_MAX_RESPONSE_BYTES = 16 * 1024 * 1024;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
const fault = (code, message, status = 400) => Object.assign(new Error(message), { code, status });
const packet = (type, sessionId, requestId, payload) => ({ protocol: API_PROTOCOL, type, sessionId, requestId, payload });
const METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const bytes = value => new TextEncoder().encode(JSON.stringify(value)).length;
function scalar(value) { return value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value); }

/** Paths are API-relative, never caller-selected destinations or credentials. */
export function normalizeApiRequest(input) {
  if (!plain(input) || Object.keys(input).some(key => !['method', 'path', 'query', 'body', 'bodyType', 'headers'].includes(key))) throw fault('API_INVALID_REQUEST', 'Use an API method, path and its documented parameters.');
  const method = input.method;
  if (!METHODS.includes(method) || typeof input.path !== 'string' || input.path.length > 4096 || /[\\?#\x00-\x20\x7f]/.test(input.path)) throw fault('API_INVALID_REQUEST', 'Use the documented method and a relative API path.');
  const path = input.path.startsWith('/api/') ? input.path : input.path.startsWith('api/') ? '/' + input.path : !input.path.startsWith('/') ? '/api/' + input.path : null;
  if (!path || path.includes('//') || path.split('/').some(segment => {
    let decoded; try { decoded = decodeURIComponent(segment); } catch { return true; }
    return decoded === '.' || decoded === '..' || /[\\/%?#\x00-\x1f\x7f]/.test(decoded);
  })) throw fault('API_INVALID_REQUEST', 'Use the documented relative API path.');
  const query = {};
  if (input.query !== undefined) {
    if (!plain(input.query) || Object.keys(input.query).length > 256) throw fault('API_INVALID_REQUEST', 'Use the endpoint’s documented query parameters.');
    for (const [key, value] of Object.entries(input.query)) {
      if (!key || key.length > 200 || /[\x00-\x1f\x7f]/.test(key) || (Array.isArray(value) ? value.length > 10000 || value.some(item => !scalar(item)) : !scalar(value))) throw fault('API_INVALID_REQUEST', 'Use simple query parameter values or lists.');
      Object.defineProperty(query, key, { value: Array.isArray(value) ? [...value] : value, enumerable: true });
    }
  }
  const headers = {};
  if (input.headers !== undefined) {
    if (!plain(input.headers) || Object.keys(input.headers).length > 2) throw fault('API_INVALID_REQUEST', 'Only Accept and Content-Type headers can be supplied.');
    for (const [key, value] of Object.entries(input.headers)) {
      const name = key.toLowerCase();
      if (!['accept', 'content-type'].includes(name) || Object.hasOwn(headers, name) || typeof value !== 'string' || !value || value.length > 500 || /[\r\n\x00]/.test(value)) throw fault('API_INVALID_REQUEST', 'Only Accept and Content-Type headers can be supplied.');
      headers[name] = value;
    }
  }
  const bodyType = input.bodyType ?? 'json';
  if (!['json', 'text', 'base64'].includes(bodyType)) throw fault('API_INVALID_REQUEST', 'Use the endpoint’s documented request body.');
  if (input.body !== undefined && bodyType !== 'json' && typeof input.body !== 'string') throw fault('API_INVALID_REQUEST', 'Text and base64 bodies must be strings.');
  if (bodyType === 'base64' && input.body !== undefined && (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.body))) throw fault('API_INVALID_REQUEST', 'Use a complete base64-encoded file body.');
  let result;
  try { result = JSON.parse(JSON.stringify({ method, path, query, headers, ...(input.body === undefined ? {} : { body: input.body, bodyType }) })); }
  catch { throw fault('API_INVALID_REQUEST', 'The request must contain serializable data.'); }
  if (bytes(result) > API_MAX_REQUEST_BYTES) throw fault('API_REQUEST_TOO_LARGE', 'This request is larger than the preview transport supports.', 413);
  return result;
}
function validPacket(value) {
  return plain(value) && Object.keys(value).length === 5 && ['protocol', 'type', 'sessionId', 'requestId', 'payload'].every(key => Object.hasOwn(value, key)) && value.protocol === API_PROTOCOL && ['request', 'result', 'error', 'cancel'].includes(value.type) && id(value.sessionId) && id(value.requestId) && plain(value.payload);
}
function validResult(value) {
  return plain(value) && Object.keys(value).length === 4 && ['status', 'headers', 'data', 'encoding'].every(key => Object.hasOwn(value, key)) && Number.isInteger(value.status) && value.status >= 100 && value.status <= 599
    && plain(value.headers) && Object.keys(value.headers).every(key => ['content-type', 'content-disposition', 'etag', 'last-modified', 'retry-after'].includes(key) && typeof value.headers[key] === 'string')
    && ['json', 'text', 'base64', 'empty'].includes(value.encoding) && (value.encoding === 'json' || value.encoding === 'empty' && value.data === null || typeof value.data === 'string');
}

/** Create before the core client connects; works for widgets and record dialogs. */
export function createApiClient({ client, hostOrigin, hostWindow = globalThis.parent, eventTarget = globalThis.window, timeoutMs = 30000 }) {
  if (!client?.on || !exactOrigin(hostOrigin) || !hostWindow?.postMessage || !eventTarget?.addEventListener || !eventTarget?.removeEventListener || !Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new TypeError('Use the core client and exact host window and origin.');
  let connected = false, enabled = true, destroyed = false, sessionId = null;
  const pending = new Map();
  function finish(id, error, value) { const entry = pending.get(id); if (!entry) return; pending.delete(id); clearTimeout(entry.timer); entry.cleanup(); error ? entry.reject(error) : entry.resolve(value); }
  function stop(code, message) { for (const key of [...pending.keys()]) { hostWindow.postMessage(packet('cancel', sessionId, key, {}), hostOrigin); finish(key, fault(code, message, 409)); } }
  const subscriptions = [
    client.on('partner.init', value => { stop('API_CONNECTION_CHANGED', 'The app connection changed.'); connected = true; enabled = value.enabled !== false; sessionId = client.sessionId; }),
    client.on('partner.context', () => { stop('API_CONTEXT_CHANGED', 'The selected record changed.'); sessionId = client.sessionId; }),
    client.on('partner.enabled', value => { enabled = value.enabled === true; if (!enabled) stop('API_DISABLED', 'The app is paused.'); }),
    client.on('partner.closed', () => { connected = false; stop('API_CLOSED', 'The app connection ended.'); }),
  ];
  function receive(event) {
    const value = event.data;
    if (destroyed || event.source !== hostWindow || event.origin !== hostOrigin || !validPacket(value) || value.sessionId !== sessionId || client.sessionId !== sessionId || !pending.has(value.requestId)) return;
    if (value.type === 'result') {
      if (!validResult(value.payload) || bytes(value.payload) > API_MAX_RESPONSE_BYTES) return finish(value.requestId, fault('API_INVALID_RESPONSE', 'The API response could not be displayed.', 502));
      finish(value.requestId, null, value.payload);
    } else if (value.type === 'error') finish(value.requestId, fault(typeof value.payload.code === 'string' ? value.payload.code.slice(0, 100) : 'API_UNAVAILABLE', typeof value.payload.message === 'string' ? value.payload.message.slice(0, 500) : 'The API request did not finish.', Number.isInteger(value.payload.status) ? value.payload.status : 503));
  }
  eventTarget.addEventListener('message', receive);
  return {
    request(input, { signal } = {}) {
      if (destroyed || !connected || client.sessionId !== sessionId) return Promise.reject(fault('API_NOT_CONNECTED', 'Connect your app to the developer website first.', 409));
      if (!enabled) return Promise.reject(fault('API_DISABLED', 'The app is paused.', 403));
      if (signal?.aborted) return Promise.reject(fault('API_CANCELLED', 'The API request was cancelled.', 499));
      if (pending.size >= 16) return Promise.reject(fault('API_BUSY', 'Wait for another request to finish.', 503));
      let request; try { request = normalizeApiRequest(input); } catch (error) { return Promise.reject(error); }
      const nextId = requestId();
      return new Promise((resolve, reject) => {
        const cancel = () => { hostWindow.postMessage(packet('cancel', sessionId, nextId, {}), hostOrigin); finish(nextId, fault('API_CANCELLED', 'The request was cancelled. A write may already have completed; check its result before trying again.', 499)); };
        pending.set(nextId, { resolve, reject, cleanup: () => signal?.removeEventListener('abort', cancel), timer: setTimeout(() => { hostWindow.postMessage(packet('cancel', sessionId, nextId, {}), hostOrigin); finish(nextId, fault('API_TIMEOUT', 'The request timed out. A write may already have completed; check its result before trying again.', 504)); }, timeoutMs) });
        signal?.addEventListener('abort', cancel, { once: true });
        try { hostWindow.postMessage(packet('request', sessionId, nextId, request), hostOrigin); } catch { finish(nextId, fault('API_INVALID_REQUEST', 'The API request could not be sent.')); }
      });
    },
    destroy() { if (destroyed) return; stop('API_CLOSED', 'The app connection ended.'); destroyed = true; connected = false; subscriptions.forEach(unsubscribe => unsubscribe()); eventTarget.removeEventListener('message', receive); },
  };
}

/** Parent-only bridge. requestApi must use the portal’s authenticated CSRF transport. */
export function createApiHost({ targetWindow, targetOrigin, eventTarget = globalThis.window, session, requestApi, onLog = () => {} }) {
  if (!targetWindow?.postMessage || !exactOrigin(targetOrigin) || !eventTarget?.addEventListener || !eventTarget?.removeEventListener || typeof session !== 'function' || typeof requestApi !== 'function') throw new TypeError('Use an exact app window, origin and authenticated API transport.');
  let disposed = false, authority = null, creating = null, generation = 0;
  const pending = new Map(), seen = new Set();
  const base = '/api/v1/developer-api/sessions';
  const send = (message, type, payload) => targetWindow.postMessage(packet(type, message.sessionId, message.requestId, payload), targetOrigin);
  const current = initial => { const value = session(); return !disposed && value?.connected && value.enabled && value.authenticated && value.apiAllowed !== false && value.id === (initial.parentSessionId ?? initial.id) && value.identityKey === initial.identityKey; };
  async function close() {
    generation++; const old = authority; authority = null; creating = null;
    for (const [key, entry] of pending) { entry.controller.abort(); if (old) void requestApi(`${base}/${encodeURIComponent(old.id)}/requests/${encodeURIComponent(key)}`, { method: 'DELETE', keepalive: true }).catch(() => {}); }
    pending.clear(); seen.clear();
    if (old) await requestApi(`${base}/${encodeURIComponent(old.id)}`, { method: 'DELETE', keepalive: true });
  }
  async function ensure(initial) {
    if (authority && authority.parentSessionId === initial.id && authority.identityKey === initial.identityKey && (!authority.expiresAt || authority.expiresAt > Date.now())) return authority;
    if (authority) { const expired = authority; authority = null; void requestApi(`${base}/${encodeURIComponent(expired.id)}`, { method: 'DELETE', keepalive: true }).catch(() => {}); }
    if (creating) return creating;
    const epoch = generation;
    creating = requestApi(base, { method: 'POST', body: { origin: targetOrigin, parentSessionId: initial.id, ...(initial.appId ? { appId: initial.appId } : {}) } }).then(async value => {
      if (!current(initial) || epoch !== generation) { if (value?.session?.id) await requestApi(`${base}/${encodeURIComponent(value.session.id)}`, { method: 'DELETE', keepalive: true }); throw fault('API_CLOSED', 'The app connection ended.', 409); }
      if (!id(value?.session?.id)) throw fault('API_UNAVAILABLE', 'The API connection could not be created.', 503);
      return authority = { ...value.session, identityKey: initial.identityKey };
    }).finally(() => { if (epoch === generation) creating = null; });
    return creating;
  }
  async function receive(event) {
    const message = event.data;
    if (disposed || event.source !== targetWindow || event.origin !== targetOrigin || !validPacket(message)) return;
    const initial = session();
    if (!initial?.connected || initial.id !== message.sessionId || !initial.enabled) return;
    if (message.type === 'cancel') { const entry = pending.get(message.requestId); if (entry) { entry.controller.abort(); if (authority) void requestApi(`${base}/${encodeURIComponent(authority.id)}/requests/${encodeURIComponent(message.requestId)}`, { method: 'DELETE', keepalive: true }).catch(() => {}); } return; }
    if (message.type !== 'request' || seen.has(message.requestId)) return;
    if (!initial.authenticated || initial.apiAllowed === false) { send(message, 'error', { code: 'API_SIGN_IN_REQUIRED', message: initial.apiAllowed === false ? 'Full API testing is available for your local app; existing releases keep their approved permissions.' : 'Sign in to the developer website to use the API.', status: 403 }); return; }
    if (pending.size >= 16) { send(message, 'error', { code: 'API_BUSY', message: 'Wait for another request to finish.', status: 503 }); return; }
    let input; try { input = normalizeApiRequest(message.payload); } catch (error) { send(message, 'error', { code: error.code, message: error.message, status: error.status }); return; }
    seen.add(message.requestId); if (seen.size > 1024) seen.delete(seen.values().next().value);
    const entry = { controller: new AbortController() }, started = Date.now(); pending.set(message.requestId, entry);
    try {
      const connection = await ensure(initial);
      if (!current(initial) || entry.controller.signal.aborted) return;
      const value = await requestApi(`${base}/${encodeURIComponent(connection.id)}/requests`, { method: 'POST', body: { requestId: message.requestId, request: input }, signal: entry.controller.signal });
      if (!current(initial) || entry.controller.signal.aborted) return;
      if (!validResult(value?.result)) throw fault('API_INVALID_RESPONSE', 'The API response could not be displayed.', 502);
      send(message, 'result', value.result);
      try { onLog({ operation: 'api.request', status: value.result.status, durationMs: Date.now() - started, responseBytes: bytes(value.result), ...(value.diagnostic ?? {}) }); } catch { /* Observation never changes the request outcome. */ }
    } catch (error) {
      if (['API_SESSION_NOT_FOUND', 'API_SESSION_EXPIRED', 'API_APP_CHANGED'].includes(error?.code)) { const old = authority; authority = null; if (old) void requestApi(`${base}/${encodeURIComponent(old.id)}`, { method: 'DELETE', keepalive: true }).catch(() => {}); }
      if (current(initial) && !entry.controller.signal.aborted) {
        const failure = { code: typeof error?.code === 'string' ? error.code.slice(0, 100) : 'API_UNAVAILABLE', message: typeof error?.message === 'string' ? error.message.slice(0, 500) : 'The API request did not finish.', status: Number.isInteger(error?.status) ? error.status : 503 };
        send(message, 'error', failure);
        try { onLog({ operation: 'api.request', status: failure.status, errorCode: failure.code, durationMs: Date.now() - started, responseBytes: bytes(failure), synthetic: false, at: new Date().toISOString() }); } catch { /* Observation never changes the request outcome. */ }
      }
    } finally { if (pending.get(message.requestId) === entry) pending.delete(message.requestId); }
  }
  eventTarget.addEventListener('message', receive);
  return {
    sync() { const value = session(); if ((authority && !current(authority)) || (creating && (!value?.connected || !value.enabled || !value.authenticated || value.apiAllowed === false))) void close().catch(() => {}); },
    dispose() { if (disposed) return; disposed = true; eventTarget.removeEventListener('message', receive); void close().catch(() => {}); },
  };
}
