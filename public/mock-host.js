import { createDemoHost } from './sdk/demo-host.js';
import { createThemeController } from './lib/theme.js';
import { recordContextKey } from './sdk/context.js';
const $ = id => document.getElementById(id);
const records = await fetch('./fixtures/records.json').then(response => { if (!response.ok) throw Error('Fixtures unavailable'); return response.json(); });
const manifest = await fetch('./manifest.json').then(response => { if (!response.ok) throw Error('Manifest unavailable'); return response.json(); });
const theme = createThemeController({ document, window, fontSource: 'bundled' });
$('theme').value = theme.look;
const choices = new Map(records.map(record => [recordContextKey(record), record]));
for (const [key, record] of choices) {
  const option = document.createElement('option'); option.value = key;
  option.textContent = record.kind === 'group' ? `${record.name} · ${record.groupType ?? 'People group'}` : `${record.address}${record.marketingRole ? ` · ${record.marketingRole.type} · ${record.marketingRole.status ?? 'Marketing role'}` : ' · Property only'}`;
  $('property').append(option);
}
const scenarios = ['success', 'slow', 'throttled', 'expired', 'forbidden', 'missing'].map(id => ({ id }));
let host, currentContext = null, ended = false;
const selection = () => $('property').value === 'none' ? null : choices.get($('property').value);
function restart() {
  host?.dispose();
  const frame = $('app');
  currentContext = selection(); ended = false;
  const widget = currentContext === null;
  $('save').hidden = widget; $('cancel').hidden = widget;
  // Build the host before navigation so the real SDK hello cannot beat binding.
  host = createDemoHost({ targetWindow: frame.contentWindow, targetOrigin: location.origin, context: currentContext,
    manifest: { ...manifest, synthetic: true, ...(widget ? { surface: 'dashboard-widget', permissions: [] } : {}) }, scenarios, theme: $('theme').value, ...(widget ? {} : { dialog: manifest.dialog ?? {} }),
    onDialogState: state => { $('save').textContent = state.label; $('save').hidden = !state.visible; $('save').disabled = !state.actionEnabled; $('save').setAttribute('aria-busy', String(state.busy)); $('cancel').hidden = !state.config.showCancelButton; $('cancel').textContent = state.config.cancelText; },
    onState: ({ status }) => { ended = status === 'closed'; $('mock-status').textContent = `Synthetic host: ${status}`; },
    onLog: entry => { $('mock-status').textContent = `${entry.operation}: ${entry.errorCode ?? 'completed'} · ${entry.durationMs} ms`; } });
  host.setScenario($('outcome').value); host.setEnabled($('enabled').checked);
  frame.src = './?hostOrigin=' + encodeURIComponent(location.origin);
}
$('restart').addEventListener('click', restart);
$('property').addEventListener('change', () => {
  const next = selection();
  if (!next || currentContext === null || ended) { restart(); return; }
  currentContext = next;
  host.setContext(next); // Same-property role changes exercise real context invalidation.
});
$('outcome').addEventListener('change', () => host.setScenario($('outcome').value));
$('theme').addEventListener('change', () => { theme.setLook($('theme').value); host.setTheme($('theme').value); });
$('enabled').addEventListener('change', () => host.setEnabled($('enabled').checked));
$('save').addEventListener('click', () => host.sendAction('save'));
$('cancel').addEventListener('click', () => host.close());
$('close').addEventListener('click', () => host.close());
window.addEventListener('pagehide', () => { host?.dispose(); theme.dispose(); }, { once: true });
restart();
