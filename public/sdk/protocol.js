/** Versioned partner contract shared by synthetic and connected hosts. */
export const PROTOCOL = 'dezrez.partner/1';
export const SDK_VERSION = '0.2.0';
export const OPERATIONS = Object.freeze(['property.read', 'appState.get', 'appState.set']);
export const THEMES = Object.freeze(['light', 'dark', 'high-contrast']);
const TYPES = new Set([
  'partner.hello', 'partner.init', 'partner.request', 'partner.result', 'partner.error',
  'partner.cancel', 'partner.context', 'partner.theme', 'partner.enabled', 'partner.action',
  'partner.closed', 'partner.actionState', 'partner.actionResult',
]);
const ID = /^[a-zA-Z0-9_-]{1,100}$/;

export function requestId() {
  return globalThis.crypto?.randomUUID?.() ?? `demo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function exactOrigin(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value && !url.username && !url.password;
  } catch { return false; }
}

export function envelope(type, sessionId, id, payload = {}) {
  return { protocol: PROTOCOL, type, sessionId, requestId: id, payload };
}

export function isEnvelope(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (value.protocol !== PROTOCOL || !TYPES.has(value.type) || !ID.test(value.requestId ?? '')) return false;
  if (value.type === 'partner.hello') {
    if (value.sessionId !== null) return false;
  } else if (!ID.test(value.sessionId ?? '')) return false;
  if (!value.payload || typeof value.payload !== 'object' || Array.isArray(value.payload)) return false;
  try { return JSON.stringify(value).length <= 16_384; } catch { return false; }
}

export function demoError(code, message, status = 400) {
  return Object.assign(new Error(message), { code, status });
}
