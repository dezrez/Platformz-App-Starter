const plain = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
const label = value => {
  if (typeof value !== 'string' || value.length < 1 || value.length > 30 || !value.trim() || /[<>\u0000-\u001f\u007f-\u009f]/.test(value)) throw new TypeError('Dialog labels must contain 1–30 plain text characters.');
  return value.trim();
};

/** Display configuration only. Never mutates a manifest or grants authority. */
export function normalizeDialogSettings(input) {
  if (input === undefined) input = {};
  if (!plain(input) || Object.keys(input).some(key => !['actionText', 'showCancelButton', 'cancelText'].includes(key))) throw new TypeError('Unsupported dialog settings.');
  const actionText = input.actionText === undefined ? 'Save' : input.actionText === null ? null : label(input.actionText);
  const cancelText = input.cancelText === undefined ? 'Cancel' : label(input.cancelText);
  const showCancelButton = input.showCancelButton === undefined ? true : input.showCancelButton;
  if (typeof showCancelButton !== 'boolean') throw new TypeError('Dialog cancel visibility must be a boolean.');
  return Object.freeze({ actionText, showCancelButton, cancelText });
}

export function normalizeActionState(input) {
  if (!plain(input) || !Object.keys(input).length || Object.keys(input).some(key => !['label', 'enabled'].includes(key))) throw new TypeError('Use only an action label and enabled state.');
  const result = {};
  if (Object.hasOwn(input, 'label')) result.label = label(input.label);
  if (Object.hasOwn(input, 'enabled')) {
    if (typeof input.enabled !== 'boolean') throw new TypeError('Action enabled state must be a boolean.');
    result.enabled = input.enabled;
  }
  return result;
}

export function validActionResult(input) {
  return plain(input) && Object.keys(input).length === 2 && Object.hasOwn(input, 'actionId') && Object.hasOwn(input, 'success') && identifier(input.actionId) && typeof input.success === 'boolean';
}

/** Host-owned UI state. It has no operation, permission or credential authority. */
export function createDialogActions({ settings, active, connected, pendingRequests, send, close, nextId, onState = () => {}, onResult = () => {} }) {
  const config = normalizeDialogSettings(settings);
  let text = config.actionText ?? '', ready = false, pending = null, disposed = false;
  const seen = new Set();
  const state = () => ({ config, label: text, visible: config.actionText !== null, actionEnabled: !disposed && config.actionText !== null && ready && active() && connected() && !pending && pendingRequests() === 0, busy: !disposed && pending !== null });
  const publish = () => { try { onState(state()); } catch { /* A rendering callback cannot change host gating. */ } };
  function accept(id) {
    if (!identifier(id) || seen.has(id)) return false;
    if (seen.size >= 256) { ready = false; pending = null; publish(); return false; }
    seen.add(id); return true;
  }
  return {
    publish,
    receiveState(payload, id) {
      if (disposed || !connected()) return false;
      let update; try { update = normalizeActionState(payload); } catch { return false; }
      if (!accept(id)) return false;
      if (update.label !== undefined) text = update.label;
      if (update.enabled !== undefined) ready = update.enabled;
      publish(); return true;
    },
    receiveResult(payload, id) {
      if (disposed || !connected() || !validActionResult(payload) || payload.actionId !== pending || payload.success && pendingRequests() > 0 || !accept(id)) return false;
      if (!active()) { ready = false; pending = null; publish(); return false; }
      pending = null;
      try { onResult({ actionId: payload.actionId, success: payload.success }); }
      catch { /* A trusted callback failure must not bypass close/revocation. */ }
      finally { if (payload.success) close(); else publish(); }
      return true;
    },
    dispatch(action) {
      if (action !== 'save' || !state().actionEnabled) return false;
      pending = nextId(); const actionId = pending; publish(); send('partner.action', nextId(), { action, actionId }); return actionId;
    },
    invalidate({ context = false } = {}) {
      ready = false; pending = null;
      if (context) { text = config.actionText ?? ''; seen.clear(); }
      publish();
    },
    dispose() { if (disposed) return; disposed = true; ready = false; pending = null; publish(); },
    get config() { return config; },
  };
}
