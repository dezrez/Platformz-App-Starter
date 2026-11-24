import { OPERATIONS } from './protocol.js';

export const PREVIEW_DIAGNOSTICS_VERSION = 1;
const MAX_TIME = 8_640_000_000_000_000;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const own = (value, key) => {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
};
const integer = (value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= minimum && value <= maximum;

/** Illustrative synthetic scenario state only; never a connected token limit. */
export function normalizeBudgetUsage(value) {
  try {
    if (!record(value) || own(value, 'version') !== 1) return null;
    const kind = own(value, 'kind');
    if (kind !== 'example-session') return null;
    const observedAtMs = own(value, 'observedAtMs');
    const sharedLimitsMayApply = own(value, 'sharedLimitsMayApply');
    const input = own(value, 'windows');
    const length = Array.isArray(input) ? own(input, 'length') : null;
    if (!integer(observedAtMs, 0, MAX_TIME) || sharedLimitsMayApply !== false || length !== 1) return null;
    const durations = new Set();
    const windows = [];
    for (let index = 0; index < length; index++) {
      const item = own(input, String(index));
      if (!record(item)) return null;
      const windowMs = own(item, 'windowMs');
      const used = own(item, 'used');
      const limit = own(item, 'limit');
      const remaining = own(item, 'remaining');
      const resetsAtMs = own(item, 'resetsAtMs');
      if (!integer(limit, 1) || !integer(used, 0, limit) || !integer(remaining, 0, limit) || remaining !== limit - used) return null;
      if (windowMs !== null || resetsAtMs !== null) return null;
      if (durations.has(windowMs)) return null;
      durations.add(windowMs);
      windows.push({ windowMs, used, limit, remaining, resetsAtMs });
    }
    return { version: 1, kind, observedAtMs, sharedLimitsMayApply, windows };
  } catch { return null; }
}

export function normalizePreviewObservation(value) {
  try {
    if (!record(value)) return null;
    const startedAtMs = own(value, 'startedAtMs');
    const completedAtMs = own(value, 'completedAtMs');
    const contextEpoch = own(value, 'contextEpoch');
    const inFlightAtStart = own(value, 'inFlightAtStart');
    if (!integer(startedAtMs, 0, MAX_TIME) || !integer(completedAtMs, startedAtMs, MAX_TIME) || !integer(contextEpoch, 1) || !integer(inFlightAtStart, 0, 256)) return null;
    return { startedAtMs, completedAtMs, contextEpoch, inFlightAtStart };
  } catch { return null; }
}

// Only recognised host/broker codes are retained. Request IDs, arbitrary error
// strings, parameters, results, record identifiers and manifest text are not.
const ERROR_CODES = new Set(`AGENCY_FORBIDDEN AGENCY_POLICY_UNAVAILABLE AGENCY_SERVICE_UNAVAILABLE ALREADY_CONNECTED APP_ACCESS_REVOKED APP_DEVELOPER_REQUIRED APP_ID_IMMUTABLE APP_NOT_AVAILABLE APP_NOT_FOUND APP_ORIGIN_FORBIDDEN APP_OWNER_REQUIRED APP_SUSPENDED APP_SUSPENSION_CHANGED APP_SUSPENSION_REQUIRED BUDGET_CAPACITY CANCELLED CLIENT_DESTROYED CONCURRENCY_LIMIT CONNECTED_PROVIDER_NOT_CONFIGURED CONTEXT_CHANGED CONTEXT_FORBIDDEN CONTEXT_NOT_FOUND CONTEXT_PERMISSION_DENIED CONTEXT_REQUIRED CONTROL_CAPACITY_REACHED CONTROL_ID_CONFLICT CONTROL_STORAGE_LIMIT DEMO_BUDGET_EXCEEDED DEMO_ERROR GRANT_CONTEXT_MISMATCH GRANT_FORBIDDEN GRANT_NOT_ACTIVE GRANT_NOT_FOUND GRANT_NOT_PENDING GRANT_REVOKED HANDSHAKE_TIMEOUT HOST_CLOSED HOST_DISABLED HOST_ERROR IDENTITY_MODE_MISMATCH INVALID_APPROVAL INVALID_DEVELOPERS INVALID_DIALOG INVALID_DIALOG_UPDATE INVALID_ENVIRONMENT INVALID_EXPIRY INVALID_INPUT INVALID_MANIFEST INVALID_MANIFEST_REVISION INVALID_NOTE INVALID_PAGINATION INVALID_PARAMS INVALID_PERMISSIONS INVALID_REQUEST INVALID_STATE INVALID_STATE_DELETION INVALID_VERSION MANIFEST_REVISION_CHANGED NETWORK_UNAVAILABLE NOT_CONNECTED OPERATION_FAILED OPERATION_NOT_ALLOWED PERMISSION_DENIED POLICY_NOT_CONFIGURED PREVIEW_LIMIT PROPERTY_LIST_UNAVAILABLE PROPERTY_SERVICE_UNAVAILABLE RATE_LIMITED REGISTRATION_ENVIRONMENT_MISMATCH RELEASE_AUTHORITY_INVALID RELEASE_AUTHORITY_MISMATCH RELEASE_AUTHORITY_NOT_CONFIGURED RELEASE_AUTHORITY_UNAVAILABLE RELEASE_CHANGED RELEASE_NOT_ENABLED RELEASE_ORIGIN_MISMATCH REQUEST_CANCELLED REQUEST_FAILED REQUEST_ID_REUSED REQUEST_STORE_FULL REQUEST_TIMEOUT REVIEWER_REQUIRED SCENARIO_CHANGED SERVICE_UNAVAILABLE SESSION_EXPIRED SESSION_NOT_FOUND SESSION_STALE STATE_CONFLICT STATE_QUOTA_EXCEEDED SUSPENSION_REVISION_UNAVAILABLE TEST_AGENCY_REQUIRED TOO_MANY_PENDING UNAUTHENTICATED UNSUPPORTED_MANIFEST`.split(' '));
const READS = new Set(['property.read', 'appState.get']);
const copy = value => structuredClone(value);
const knownNumber = value => integer(value) ? value : null;

function manifestSummary(value) {
  if (!record(value)) return { permissions: null, polling: { declared: false, intervalMs: null } };
  const permissions = own(value, 'permissions');
  const length = Array.isArray(permissions) ? own(permissions, 'length') : null;
  let allowed = null;
  if (integer(length, 0, OPERATIONS.length)) {
    const copied = [];
    for (let index = 0; index < length; index++) {
      const item = own(permissions, String(index));
      if (!OPERATIONS.includes(item)) { copied.length = 0; break; }
      copied.push(item);
    }
    if (copied.length === length) allowed = [...new Set(copied)];
  }
  const activity = own(value, 'activity');
  const interval = record(activity) ? own(activity, 'pollingIntervalMs') : undefined;
  return {
    permissions: allowed,
    polling: { declared: interval === null || integer(interval, 1), intervalMs: integer(interval, 1) ? interval : null },
  };
}

function analyse(events, runs) {
  const findings = [];
  const groups = new Map();
  let repeatedReads = 0; let repeatAfterError = 0; let overlappingRequests = 0; let peakInFlight = null; let manifestMismatches = 0; let possibleManifestMismatches = 0;
  for (const event of events) {
    const info = runs.get(event.previewRun);
    if (info?.manifest.permissions && OPERATIONS.includes(event.operation) && !info.manifest.permissions.includes(event.operation)) {
      manifestMismatches++;
      findings.push({ code: 'UNDECLARED_OPERATION', previewRun: event.previewRun, operation: event.operation, count: 1 });
    }
    if (!event.observation) continue;
    const active = event.observation.inFlightAtStart;
    peakInFlight = Math.max(peakInFlight ?? 0, active);
    if (active > 1) overlappingRequests++;
    if (!READS.has(event.operation)) continue;
    const key = `${event.previewRun}:${event.observation.contextEpoch}:${event.operation}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(event);
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.observation.startedAtMs - b.observation.startedAtMs || a.sequence - b.sequence);
    let previous;
    const successful = [];
    for (const event of group) {
      if (previous && previous.status !== 200 && !event.cached) repeatAfterError++;
      if (event.status === 200 && !event.cached) successful.push(event);
      previous = event;
    }
    repeatedReads += Math.max(0, successful.length - 1);
    if (successful.length < 4) continue;
    const intervals = successful.slice(1).map((event, index) => event.observation.startedAtMs - successful[index].observation.startedAtMs);
    if (intervals.some(value => value <= 0)) continue;
    const ordered = [...intervals].sort((a, b) => a - b);
    const median = ordered[Math.floor(ordered.length / 2)];
    // A descriptive pattern, never a calibrated performance limit or a failed
    // certification. Manual clicks can also look regular.
    if (Math.max(...intervals) - Math.min(...intervals) > median * 0.1) continue;
    const first = successful[0];
    const polling = runs.get(first.previewRun)?.manifest.polling;
    const mismatch = polling?.declared === true && (polling.intervalMs === null || median < polling.intervalMs);
    if (mismatch) possibleManifestMismatches++;
    findings.push({ code: mismatch ? 'POSSIBLE_POLLING_MISMATCH' : 'POSSIBLE_POLLING', previewRun: first.previewRun, operation: first.operation, count: successful.length, observedIntervalMs: median, minimumIntervalMs: Math.min(...intervals), maximumIntervalMs: Math.max(...intervals), ...(polling?.declared ? { declaredIntervalMs: polling.intervalMs } : {}) });
  }
  if (repeatedReads) findings.unshift({ code: 'REPEATED_READS', count: repeatedReads });
  if (repeatAfterError) findings.push({ code: 'READ_AFTER_ERROR', count: repeatAfterError });
  if (overlappingRequests) findings.push({ code: 'OVERLAPPING_REQUESTS', count: overlappingRequests });
  return { repeatedReads, repeatAfterError, overlappingRequests, peakInFlight, manifestMismatches, possibleManifestMismatches, findings };
}

/** Bounded, parent-only preview evidence. This never observes private payloads. */
export function createPreviewDiagnostics({ maximumEvents = 200, now = Date.now } = {}) {
  if (!integer(maximumEvents, 1, 200) || typeof now !== 'function') throw new TypeError('Use at most 200 preview events.');
  let events = []; let sequence = 0; let activeRun = null;
  const runs = new Map();
  let seenModes = new Set();
  const modeLabel = value => value === true ? 'synthetic' : value === false ? 'connected' : 'unknown';
  const emptyTotals = () => ({ requests: 0, errors: 0, responseBytes: 0, unknownResponseSizes: 0, cachedResponses: 0, countersSaturated: false });
  let totals = emptyTotals();
  function add(name, amount) {
    if (totals[name] > Number.MAX_SAFE_INTEGER - amount) { totals[name] = Number.MAX_SAFE_INTEGER; totals.countersSaturated = true; }
    else totals[name] += amount;
  }
  function pruneRuns() {
    const retained = new Set(events.map(event => event.previewRun));
    if (activeRun !== null) retained.add(activeRun);
    for (const key of runs.keys()) if (!retained.has(key)) runs.delete(key);
  }
  return {
    startRun(run, { manifest = null, source = 'unknown', synthetic = source === 'example' ? true : null } = {}) {
      if (!integer(run, 1)) throw new TypeError('A preview run number is required.');
      activeRun = run;
      runs.set(run, { manifest: manifestSummary(manifest), source: ['example', 'broker'].includes(source) ? source : 'unknown', synthetic: typeof synthetic === 'boolean' ? synthetic : null });
      pruneRuns();
    },
    record(value, { run = activeRun } = {}) {
      if (!integer(run, 1) || !record(value)) return null;
      const operation = own(value, 'operation');
      const error = own(value, 'errorCode');
      const status = own(value, 'status');
      const observation = normalizePreviewObservation(own(value, 'observation'));
      const timestamp = observation?.completedAtMs ?? now();
      const info = runs.get(run);
      const entry = {
        sequence: ++sequence, previewRun: run, source: operation === 'api.request' ? 'broker' : info?.source ?? 'unknown', synthetic: operation === 'api.request' ? false : info?.synthetic ?? null,
        operation: operation === 'api.request' || OPERATIONS.includes(operation) ? operation : 'unsupported',
        status: integer(status, 100, 599) ? status : 0,
        durationMs: knownNumber(own(value, 'durationMs')),
        responseBytes: knownNumber(own(value, 'responseBytes')),
        errorCode: error === null || error === undefined ? null : ERROR_CODES.has(error) ? error : 'OTHER_ERROR',
        at: integer(timestamp, 0, MAX_TIME) ? new Date(timestamp).toISOString() : null,
        cached: own(value, 'cached') === true, observation,
      };
      events.push(entry);
      seenModes.add(modeLabel(entry.synthetic));
      if (events.length > maximumEvents) events.shift();
      add('requests', 1);
      if (entry.status === 0 || entry.status >= 400) add('errors', 1);
      if (entry.responseBytes === null) add('unknownResponseSizes', 1); else add('responseBytes', entry.responseBytes);
      if (entry.cached) add('cachedResponses', 1);
      pruneRuns();
      return copy(entry);
    },
    clear() {
      events = []; totals = emptyTotals(); sequence = 0; seenModes = new Set();
      pruneRuns();
    },
    endRun(run = activeRun) {
      if (activeRun === run) activeRun = null;
      pruneRuns();
    },
    reset() { events = []; totals = emptyTotals(); sequence = 0; activeRun = null; runs.clear(); seenModes = new Set(); },
    snapshot() {
      const analysis = analyse(events, runs);
      const dataModes = new Set(seenModes);
      if (activeRun !== null) dataModes.add(modeLabel(runs.get(activeRun)?.synthetic));
      return copy({
        schemaVersion: 2, report: 'dezrez.preview-diagnostics/1',
        synthetic: dataModes.size === 1 && !dataModes.has('unknown') ? dataModes.has('synthetic') : null,
        dataModes: [...dataModes].sort(),
        summary: { ...totals, retries: null }, retainedRequests: events.length,
        activePreviewRun: activeRun,
        previewRuns: [...runs].map(([previewRun, info]) => ({ previewRun, source: info.source, synthetic: info.synthetic, manifest: info.manifest })),
        events, analysis,
        coverage: { patternScope: 'Retained preview events, separated by preview and context epoch.', retries: 'The preview cannot confirm automatic retries. A read after an error is a pattern, not a retry count.', polling: 'Four successful reads with three positive intervals within a 10% range form a possible polling pattern; manual actions may also match.', observation: 'Only the trusted host bridge is observed. Direct iframe network traffic, app caches and activity after the host closes are not measured.' },
        scope: 'Redacted preview observations, not certification or capacity evidence. No credentials, request IDs, record identifiers, parameters, response payloads or note text are collected.',
      });
    },
  };
}
