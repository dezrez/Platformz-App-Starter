/** Public app-details contract. Declarations describe intent; they grant no access. */
export const MANIFEST_VERSION = 1;
export const MANIFEST_SDK_VERSION = '0.2.0';
/** API declaration, independent from the older record operations. */
export function hasApiDeclaration(manifest) {
  const value = manifest?.api;
  if (value === undefined) return false;
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 1 || !Object.hasOwn(value, 'version') || value.version !== 'dezrez.api/1') throw Object.assign(new TypeError('Use api: { version: "dezrez.api/1" } for full API development.'), { code: 'INVALID_API_DECLARATION' });
  return true;
}
const operations = ['property.read', 'appState.get', 'appState.set'];
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const copy = value => structuredClone(value);
function emailContact(value) {
  const parts = value.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  const labels = domain.split('.');
  return domain.length <= 253 && labels.length >= 2 && labels.every(label => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label));
}
function invalid(path) { throw Object.assign(new TypeError(`Ask your AI to correct the app details at ${path}.`), { code: 'INVALID_APP_DETAILS' }); }

/** Legacy records are identified without changing their bytes or interpreting new fields. */
export function normalizeManifestDeclarations(manifest) {
  if (!plain(manifest)) invalid('manifest');
  const api = hasApiDeclaration(manifest);
  if (manifest.manifestVersion === undefined) return { legacy: true, complete: false, missing: ['manifestVersion'], fields: {} };
  if (manifest.manifestVersion !== MANIFEST_VERSION) invalid('manifestVersion');
  const missing = [];
  const absent = (value, path) => {
    if (value === undefined || value === null || typeof value === 'string' && !value.trim()) { missing.push(path); return true; }
    return false;
  };
  const object = (value, path, keys) => {
    if (absent(value, path)) return null;
    if (!plain(value) || Object.keys(value).some(key => !keys.includes(key))) invalid(path);
    return value;
  };
  const text = (value, path, maximum = 100) => {
    if (absent(value, path)) return null;
    if (typeof value !== 'string' || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)) invalid(path);
    return value;
  };
  const integer = (value, path, minimum = 0) => {
    if (absent(value, path)) return null;
    if (!Number.isSafeInteger(value) || value < minimum) invalid(path);
    return value;
  };
  const boolean = (value, path) => {
    if (absent(value, path)) return null;
    if (typeof value !== 'boolean') invalid(path);
    return value;
  };
  const list = (value, path, normalize, { minimum = 1, maximum = 32 } = {}) => {
    if (absent(value, path)) return null;
    if (!Array.isArray(value) || value.length > maximum) invalid(path);
    if (value.length < minimum) missing.push(path);
    return Array.from(value, (item, index) => normalize(item, `${path}[${index}]`));
  };
  const id = (value, path) => {
    const result = text(value, path, 100);
    if (result !== null && !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,99}$/.test(result)) invalid(path);
    return result;
  };
  const unique = (values, path, key = value => value) => {
    const known = values?.map(key).filter(value => value !== null && value !== undefined);
    if (known && new Set(known).size !== known.length) invalid(path);
    return values;
  };
  text(manifest.name, 'name', 100);
  for (const [key, supported] of [['host', ['rezi']], ['surface', ['property-action', 'record-action', ...(api ? ['dashboard-widget'] : [])]]]) {
    const value = text(manifest[key], key);
    if (value !== null && !supported.includes(value)) invalid(key);
  }
  const example = boolean(manifest.example, 'example');
  const partnerInput = object(manifest.partner, 'partner', ['organisation', 'supportContact']);
  let partner = null;
  if (partnerInput) {
    const organisation = text(partnerInput.organisation, 'partner.organisation', 160);
    const supportContact = text(partnerInput.supportContact, 'partner.supportContact', 254);
    if (supportContact !== null) {
      let allowed = emailContact(supportContact);
      try { const url = new URL(supportContact); allowed ||= url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash; } catch { /* Plain email is also supported. */ }
      if (!allowed) invalid('partner.supportContact');
    }
    partner = { organisation, supportContact };
  }
  const compatibilityInput = object(manifest.compatibility, 'compatibility', ['sdkVersion', 'hosts', 'surfaces']);
  let compatibility = null;
  if (compatibilityInput) {
    const sdkVersion = text(compatibilityInput.sdkVersion, 'compatibility.sdkVersion');
    if (sdkVersion !== null && !['0.1.0', MANIFEST_SDK_VERSION].includes(sdkVersion)) invalid('compatibility.sdkVersion');
    const hosts = unique(list(compatibilityInput.hosts, 'compatibility.hosts', (value, path) => { const result = text(value, path); if (result !== null && result !== 'rezi') invalid(path); return result; }), 'compatibility.hosts');
    const surfaces = unique(list(compatibilityInput.surfaces, 'compatibility.surfaces', (value, path) => { const result = text(value, path); if (result !== null && !['property-action', 'record-action', ...(api ? ['dashboard-widget'] : [])].includes(result)) invalid(path); return result; }), 'compatibility.surfaces');
    compatibility = { sdkVersion, hosts, surfaces };
  }
  const usesAppState = Array.isArray(manifest.permissions) && manifest.permissions.some(operation => ['appState.get', 'appState.set'].includes(operation));
  // Business records persist through their own API. An API-only app does not
  // have to pretend it stores private notes merely to describe certification.
  const storageRequired = !api || usesAppState;
  const storageInput = !storageRequired && manifest.storage == null ? null : object(manifest.storage, 'storage', ['scope', 'schemaVersion', 'expectedMaximumBytes']);
  let storage = null;
  if (storageInput) {
    const scope = text(storageInput.scope, 'storage.scope');
    const schemaVersion = integer(storageInput.schemaVersion, 'storage.schemaVersion', 1);
    if (scope !== null && !['app-agency-user-property', 'app-agency-user-context'].includes(scope) || schemaVersion !== null && schemaVersion !== 1) invalid('storage');
    storage = { scope, schemaVersion, expectedMaximumBytes: integer(storageInput.expectedMaximumBytes, 'storage.expectedMaximumBytes', 1) };
  }
  const activityInput = object(manifest.activity, 'activity', ['initializationCalls', 'pollingIntervalMs', 'refreshTriggers', 'backgroundWork']);
  let activity = null;
  if (activityInput) {
    const initializationCalls = unique(list(activityInput.initializationCalls, 'activity.initializationCalls', (value, path) => {
      const item = object(value, path, ['operation', 'count']); if (!item) return null;
      const operation = text(item.operation, `${path}.operation`);
      if (operation !== null && ![...operations, ...(api ? ['api.request'] : [])].includes(operation)) invalid(`${path}.operation`);
      return { operation, count: integer(item.count, `${path}.count`) };
    }, { minimum: 0, maximum: api ? 4 : 3 }), 'activity.initializationCalls', item => item?.operation);
    if (!own(activityInput, 'pollingIntervalMs') || activityInput.pollingIntervalMs === undefined) missing.push('activity.pollingIntervalMs');
    else if (activityInput.pollingIntervalMs !== null) invalid('activity.pollingIntervalMs');
    const refreshTriggers = unique(list(activityInput.refreshTriggers, 'activity.refreshTriggers', (value, path) => {
      const result = text(value, path); if (result !== null && !['manual', 'context-change', 'enabled', 'visible'].includes(result)) invalid(path); return result;
    }), 'activity.refreshTriggers');
    const backgroundWork = boolean(activityInput.backgroundWork, 'activity.backgroundWork');
    if (backgroundWork === true) invalid('activity.backgroundWork');
    activity = { initializationCalls, pollingIntervalMs: null, refreshTriggers, backgroundWork };
  }
  const usageInput = object(manifest.expectedUsage, 'expectedUsage', ['version', 'status', 'horizonMs', 'maxConcurrentInstances', 'sessionStarts', 'actions']);
  let expectedUsage = null;
  if (usageInput) {
    if (usageInput.version !== undefined && usageInput.version !== null && usageInput.version !== 1) invalid('expectedUsage.version');
    const version = integer(usageInput.version, 'expectedUsage.version', 1);
    const status = text(usageInput.status, 'expectedUsage.status');
    if (status === 'not-provided') {
      if (Object.keys(usageInput).some(key => !['version', 'status'].includes(key))) invalid('expectedUsage');
      missing.push('expectedUsage'); expectedUsage = { version, status };
    } else if (status === 'declared' || status === null) {
      const actions = unique(list(usageInput.actions, 'expectedUsage.actions', (value, path) => {
        const item = object(value, path, ['name', 'count']); if (!item) return null;
        return { name: text(item.name, `${path}.name`), count: integer(item.count, `${path}.count`) };
      }), 'expectedUsage.actions', item => item?.name);
      expectedUsage = { version, status, horizonMs: integer(usageInput.horizonMs, 'expectedUsage.horizonMs', 1), maxConcurrentInstances: integer(usageInput.maxConcurrentInstances, 'expectedUsage.maxConcurrentInstances', 1), sessionStarts: integer(usageInput.sessionStarts, 'expectedUsage.sessionStarts'), actions };
    } else invalid('expectedUsage.status');
  }
  const testingInput = object(manifest.testing, 'testing', ['journeys', 'fixtures']);
  const testing = testingInput ? { journeys: unique(list(testingInput.journeys, 'testing.journeys', id), 'testing.journeys'), fixtures: unique(list(testingInput.fixtures, 'testing.fixtures', id), 'testing.fixtures') } : null;
  if (manifest.surface === 'record-action') {
    if (compatibility?.sdkVersion !== MANIFEST_SDK_VERSION || !compatibility.surfaces?.includes('record-action')) invalid('compatibility');
    if ((storageRequired || storage) && storage?.scope !== 'app-agency-user-context') invalid('storage.scope');
  }
  if (api && (compatibility?.sdkVersion !== MANIFEST_SDK_VERSION || !compatibility.hosts?.includes(manifest.host) || !compatibility.surfaces?.includes(manifest.surface))) invalid('compatibility');
  return { legacy: false, complete: missing.length === 0, missing: [...new Set(missing)], fields: { manifestVersion: MANIFEST_VERSION, example, partner, compatibility, ...(!api || storage ? { storage } : {}), activity, expectedUsage, testing, ...(api ? { api: { version: 'dezrez.api/1' } } : {}) } };
}

export function requireCompleteManifestDeclarations(manifest) {
  const result = normalizeManifestDeclarations(manifest);
  if (!result.complete) throw Object.assign(new TypeError('Ask your AI to finish the app details before sending a private copy.'), { code: 'APP_DETAILS_REQUIRED', missing: result.missing });
  return result;
}

/** Publication eligibility is separate from permissions, certification and approval. */
export function requirePublishableManifestDeclarations(manifest) {
  const result = requireCompleteManifestDeclarations(manifest);
  let contactHost = result.fields.partner.supportContact.split('@').pop().toLowerCase();
  try { contactHost = new URL(result.fields.partner.supportContact).hostname.toLowerCase(); } catch { /* Email contact. */ }
  contactHost = contactHost.replace(/\.+$/, '');
  if (result.fields.example || /(?:^|\.)(?:invalid|test|example|localhost)$/.test(contactHost) || /^(?:.*\.)?example\.(?:com|net|org)$/.test(contactHost)) throw Object.assign(new TypeError("Replace example app details with the owner's real organisation, support contact and usage assumptions before publishing."), { code: 'EXAMPLE_APP_DETAILS' });
  return result;
}

/** Explicit fictional example only; these values are not production calibration. */
export function exampleManifestDeclarations({ surface = 'property-action' } = {}) {
  return copy({ manifestVersion: MANIFEST_VERSION, example: true,
    partner: { organisation: 'Example partner', supportContact: 'support@example.invalid' },
    compatibility: { sdkVersion: MANIFEST_SDK_VERSION, hosts: ['rezi'], surfaces: [surface] },
    storage: { scope: surface === 'record-action' ? 'app-agency-user-context' : 'app-agency-user-property', schemaVersion: 1, expectedMaximumBytes: 4096 },
    activity: { initializationCalls: [{ operation: 'property.read', count: 1 }, { operation: 'appState.get', count: 1 }], pollingIntervalMs: null, refreshTriggers: ['manual', 'context-change', 'enabled', 'visible'], backgroundWork: false },
    expectedUsage: { version: 1, status: 'declared', horizonMs: 3600000, maxConcurrentInstances: 1, sessionStarts: 1, actions: [{ name: 'read-property', count: 1 }, { name: 'save-note', count: 1 }] },
    testing: { journeys: ['initialization', 'read-property', 'save-note', 'read-error', 'save-error', 'context-change', ...(surface === 'record-action' ? ['marketing-role-change', 'group-context'] : []), 'close'], fixtures: [surface === 'record-action' ? 'dezrez-demo-records/1' : 'dezrez-demo-properties/1'] } });
}
