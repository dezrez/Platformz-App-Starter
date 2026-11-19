import { demoError, envelope, exactOrigin, isEnvelope, OPERATIONS, requestId, THEMES } from './protocol.js';
import { createDialogActions } from './dialog.js';
import { normalizeBudgetUsage } from './diagnostics.js';
import { appStateContextId, recordContextIdentity } from './context.js';

// Deliberately page-memory only. This is not durable or server-authorized storage.
const appStates = new Map();
const byteLength = value => new TextEncoder().encode(JSON.stringify(value)).length;
const clone = value => JSON.parse(JSON.stringify(value));

/** Simulate the draft contract for a single, exact iframe window and origin. */
export function createDemoHost({ targetWindow, targetOrigin, eventTarget = globalThis.window, visibilityTarget = globalThis.document, context, manifest, scenarios, theme = 'light', dialog, stateStore = appStates, onDialogState = () => {}, onActionResult = () => {}, onLog = () => {}, onState = () => {} }) {
  if (!stateStore || typeof stateStore.get !== 'function' || typeof stateStore.set !== 'function') throw new TypeError('A trusted Map-like synthetic state store is required.');
  if (!exactOrigin(targetOrigin)) throw new TypeError('An exact HTTP(S) app origin is required.');
  if (!targetWindow?.postMessage || !eventTarget?.addEventListener) throw new TypeError('An app window and event target are required.');
  if (!manifest?.id || manifest.synthetic !== true || !Array.isArray(scenarios)) throw new TypeError('A synthetic manifest and scenarios are required.');
  if (manifest.surface !== undefined && !['property-action', 'record-action', 'dashboard-widget'].includes(manifest.surface)) throw new TypeError('Choose a record dialog or no-record dashboard widget.');
  const widget = manifest.surface === 'dashboard-widget';
  if (widget ? context !== null || !Array.isArray(manifest.permissions) || manifest.permissions.length !== 0 : !context?.id || !context?.agencyId) throw new TypeError('Widgets require null context and no permissions; property apps require a selected property and agency.');
  function validateContext(value) {
    if (widget) { if (value !== null) throw new TypeError('Widgets have no selected record.'); return; }
    const identity = recordContextIdentity(value);
    if (manifest.surface !== 'record-action' && (identity.kind !== 'property' || identity.marketingRole)) throw new TypeError('Update this app to use record contexts.');
  }
  validateContext(context);
  const scenariosById = new Map(scenarios.map(item => [item.id, item]));
  const supportsDialog = !widget && dialog !== undefined;
  if (supportsDialog && (!visibilityTarget?.addEventListener || !visibilityTarget?.removeEventListener || typeof visibilityTarget.visibilityState !== 'string')) throw new TypeError('Dialog actions require the trusted parent document visibility.');
  let currentContext = clone(context);
  let currentTheme = typeof theme === 'string' ? theme : theme.look;
  if (!THEMES.includes(currentTheme)) currentTheme = 'light';
  let currentSession = requestId();
  let currentScenario = 'success';
  let enabled = true;
  let connected = false;
  let closed = false;
  let disposed = false;
  let requestCount = 0;
  let contextEpoch = 1;
  const pending = new Map();
  const seenIds = new Set();
  const send = (type, id, payload = {}) => targetWindow.postMessage(envelope(type, currentSession, id, payload), targetOrigin);
  const state = status => onState({ status });
  const stateKey = () => `${manifest.id}:${currentContext.agencyId}:${appStateContextId(currentContext)}`;
  const effectiveEnabled = () => enabled && (!supportsDialog || visibilityTarget.visibilityState === 'visible');
  const dialogActions = supportsDialog ? createDialogActions({ settings: dialog, active: () => !closed && !disposed && effectiveEnabled(), connected: () => connected, pendingRequests: () => pending.size, send, close: dispose, nextId: requestId, onState: onDialogState, onResult: onActionResult }) : null;
  function visibilityChanged() {
    if (disposed || closed) return;
    if (!effectiveEnabled()) dialogActions?.invalidate(); else dialogActions?.publish();
    if (connected) send('partner.enabled', requestId(), { enabled: effectiveEnabled() });
    state(effectiveEnabled() ? (connected ? 'connected' : 'waiting') : 'disabled');
  }
  const blockedObservation = () => ({ startedAtMs: Date.now(), contextEpoch, inFlightAtStart: 0 });
  function report(id, operation, start, status, result, errorCode = null, entry = blockedObservation()) {
    const completedAtMs = Date.now();
    const budgetUsage = widget ? null : normalizeBudgetUsage({ version: 1, kind: 'example-session', observedAtMs: completedAtMs, sharedLimitsMayApply: false, windows: [{ windowMs: null, used: Math.min(requestCount, 12), limit: 12, remaining: Math.max(0, 12 - requestCount), resetsAtMs: null }] });
    onLog({ id, operation, status, durationMs: Math.max(0, Math.round(performance.now() - start)), responseBytes: byteLength(result), errorCode, at: new Date().toISOString(), observation: { startedAtMs: entry.startedAtMs, completedAtMs, contextEpoch: entry.contextEpoch, inFlightAtStart: entry.inFlightAtStart }, budgetUsage });
  }
  function fail(id, operation, start, error, entry = blockedObservation()) {
    const payload = { code: error.code ?? 'DEMO_ERROR', message: error.message, status: error.status ?? 400 };
    send('partner.error', id, payload);
    report(id, operation, start, payload.status, payload, payload.code, entry);
  }
  function cancelPending(code, message) {
    for (const [id, entry] of pending) {
      clearTimeout(entry.timer);
      fail(id, entry.operation, entry.start, demoError(code, message, 499), entry);
    }
    pending.clear();
    dialogActions?.publish();
  }
  function validate(operation, params) {
    if (!OPERATIONS.includes(operation)) throw demoError('OPERATION_NOT_ALLOWED', 'This demo operation is not in the manifest.', 403);
    if (recordContextIdentity(currentContext).kind === 'group' && operation === 'property.read') throw demoError('CONTEXT_OPERATION_NOT_SUPPORTED', 'Property reads need a selected property.', 403);
    if (!params || typeof params !== 'object' || Array.isArray(params)) throw demoError('INVALID_PARAMS', 'Operation parameters must be an object.');
    const allowed = operation === 'appState.set' ? ['propertyId', 'note', 'version'] : ['propertyId'];
    if (Object.keys(params).some(key => !allowed.includes(key))) throw demoError('INVALID_PARAMS', 'Unexpected operation parameters.');
    if (params.propertyId !== undefined && (recordContextIdentity(currentContext).kind !== 'property' || params.propertyId !== currentContext.id)) throw demoError('CONTEXT_FORBIDDEN', 'Use only the selected record context.', 403);
    if (operation === 'appState.set') {
      if (typeof params.note !== 'string' || params.note.length > 500) throw demoError('INVALID_NOTE', 'Enter a note of at most 500 characters.');
      if (params.version !== undefined && (!Number.isSafeInteger(params.version) || params.version < 0)) throw demoError('INVALID_VERSION', 'The state version must be a nonnegative integer.');
    }
  }
  function perform(operation, params) {
    const failures = {
      throttled: ['RATE_LIMITED', 'This scenario simulates a rate limit. Try another scenario.', 429],
      expired: ['SESSION_EXPIRED', 'This scenario simulates an expired development session.', 401],
      forbidden: ['PERMISSION_DENIED', 'This scenario simulates denied operation permission.', 403],
      missing: ['CONTEXT_NOT_FOUND', 'The synthetic property is unavailable in this scenario.', 404],
    };
    if (failures[currentScenario]) throw demoError(...failures[currentScenario]);
    if (operation === 'property.read') return clone(currentContext);
    const saved = clone(stateStore.get(stateKey()) ?? { note: '', version: 0 });
    if (operation === 'appState.get') return clone(saved);
    if (params.version !== undefined && params.version !== saved.version) throw demoError('STATE_CONFLICT', 'The note changed. Read the latest version before saving.', 409);
    const next = { note: params.note, version: saved.version + 1 };
    stateStore.set(stateKey(), clone(next));
    return clone(next);
  }
  function receive(event) {
    if (disposed || closed || event.source !== targetWindow || event.origin !== targetOrigin || !isEnvelope(event.data)) return;
    const message = event.data;
    if (message.type === 'partner.hello') {
      connected = true;
      send('partner.init', message.requestId, { context: clone(currentContext), theme: { look: currentTheme }, manifest, enabled: effectiveEnabled(), synthetic: true, ...(widget ? { surface: 'dashboard-widget', permissions: [] } : manifest.surface === 'record-action' ? { surface: 'record-action' } : {}), ...(supportsDialog ? { capabilities: { dialogActions: true }, dialog: dialogActions.config } : {}) });
      state(effectiveEnabled() ? 'connected' : 'disabled');
      dialogActions?.publish();
      return;
    }
    if (!connected || message.sessionId !== currentSession) return;
    if (message.type === 'partner.actionState') { dialogActions?.receiveState(message.payload, message.requestId); return; }
    if (message.type === 'partner.actionResult') { dialogActions?.receiveResult(message.payload, message.requestId); return; }
    if (message.type === 'partner.cancel') {
      const entry = pending.get(message.requestId);
      if (entry) {
        clearTimeout(entry.timer);
        pending.delete(message.requestId);
        dialogActions?.publish();
        fail(message.requestId, entry.operation, entry.start, demoError('CANCELLED', 'The request was cancelled.', 499), entry);
      }
      return;
    }
    if (message.type !== 'partner.request') return;
    // Replayed request IDs never execute twice, especially writes. The original
    // response may already be delivered; replayed responses are intentionally absent.
    if (seenIds.has(message.requestId) || seenIds.size >= 128) return;
    seenIds.add(message.requestId);
    const start = performance.now();
    const observation = blockedObservation();
    const { operation, params } = message.payload;
    const loggedOperation = OPERATIONS.includes(operation) ? operation : 'unsupported';
    try {
      if (widget) throw demoError('CONTEXT_REQUIRED', 'Choose a record context before using a record operation.', 409);
      if (!enabled) throw demoError('HOST_DISABLED', 'The host disabled this app.', 403);
      validate(operation, params);
      requestCount += 1;
      if (requestCount > 12) throw demoError('DEMO_BUDGET_EXCEEDED', 'The illustrative session budget was reached. Restart the demo.', 429);
      const entry = { start, operation: loggedOperation, ...observation, inFlightAtStart: pending.size + 1, timer: null };
      const execute = () => {
        pending.delete(message.requestId);
        dialogActions?.publish();
        try {
          const result = perform(operation, params);
          send('partner.result', message.requestId, { result });
          report(message.requestId, loggedOperation, start, 200, { result }, null, entry);
        } catch (error) { fail(message.requestId, loggedOperation, start, error, entry); }
      };
      entry.timer = setTimeout(execute, currentScenario === 'slow' ? 1200 : 50);
      pending.set(message.requestId, entry);
      dialogActions?.publish();
    } catch (error) { fail(message.requestId, loggedOperation, start, error, observation); }
  }
  eventTarget.addEventListener('message', receive);
  if (supportsDialog) visibilityTarget.addEventListener('visibilitychange', visibilityChanged);
  dialogActions?.publish();
  state('waiting');
  function close() {
    if (disposed || closed) return;
    closed = true;
    cancelPending('HOST_CLOSED', 'The host closed this app.');
    if (connected) send('partner.closed', requestId(), {});
    connected = false; dialogActions?.dispose(); state('closed');
  }
  function dispose() {
    if (disposed) return;
    try { close(); }
    finally { disposed = true; eventTarget.removeEventListener('message', receive); if (supportsDialog) visibilityTarget.removeEventListener('visibilitychange', visibilityChanged); }
  }
  return {
    setContext(next) {
      if (disposed || closed) return;
      validateContext(next);
      cancelPending('CONTEXT_CHANGED', 'The host context changed.');
      contextEpoch += 1;
      currentContext = clone(next);
      currentSession = requestId();
      dialogActions?.invalidate({ context: true });
      seenIds.clear();
      requestCount = 0;
      if (connected) send('partner.context', requestId(), widget ? { context: null, surface: 'dashboard-widget', permissions: [] } : clone(currentContext));
    },
    setScenario(id) {
      if (!scenariosById.has(id)) throw new TypeError('Unknown synthetic scenario.');
      cancelPending('SCENARIO_CHANGED', 'The synthetic scenario changed.');
      currentScenario = id;
    },
    setTheme(look) {
      if (disposed || closed || !THEMES.includes(look)) return;
      currentTheme = look;
      if (connected) send('partner.theme', requestId(), { look });
    },
    setEnabled(value) {
      if (disposed || closed) return;
      enabled = Boolean(value);
      if (!enabled) cancelPending('HOST_DISABLED', 'The host disabled this app.');
      if (!effectiveEnabled()) dialogActions?.invalidate(); else dialogActions?.publish();
      if (connected) send('partner.enabled', requestId(), { enabled: effectiveEnabled() });
      state(effectiveEnabled() ? (connected ? 'connected' : 'waiting') : 'disabled');
    },
    sendAction(action) {
      if (widget || disposed || closed || !connected || !enabled || action !== 'save') return false;
      if (dialogActions) return dialogActions.dispatch(action);
      send('partner.action', requestId(), { action });
      return true;
    },
    close,
    dispose,
    get sessionId() { return currentSession; },
  };
}
