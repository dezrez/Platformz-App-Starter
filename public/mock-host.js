import { createDemoHost } from './sdk/demo-host.js';
import { createThemeController } from './lib/theme.js';
const $ = id => document.getElementById(id);
const properties = await fetch('./fixtures/properties.json').then(response => { if (!response.ok) throw Error('Fixtures unavailable'); return response.json(); });
const manifest = await fetch('./manifest.json').then(response => { if (!response.ok) throw Error('Manifest unavailable'); return response.json(); });
const theme = createThemeController({ document, window, fontSource: 'bundled' });
$('theme').value = theme.look;
for (const property of properties) { const option = document.createElement('option'); option.value = property.id; option.textContent = property.address; $('property').append(option); }
const scenarios = ['success', 'slow', 'throttled', 'expired', 'forbidden', 'missing'].map(id => ({ id }));
let host;
function restart() {
  host?.dispose();
  const frame = $('app');
  const widget = $('property').value === 'none';
  $('save').hidden = widget; $('cancel').hidden = widget;
  // Build the host before navigation so the real SDK hello cannot beat binding.
  host = createDemoHost({ targetWindow: frame.contentWindow, targetOrigin: location.origin, context: widget ? null : properties.find(p => p.id === $('property').value),
    manifest: { ...manifest, synthetic: true, ...(widget ? { surface: 'dashboard-widget', permissions: [] } : {}) }, scenarios, theme: $('theme').value, ...(widget ? {} : { dialog: manifest.dialog ?? {} }),
    onDialogState: state => { $('save').textContent = state.label; $('save').hidden = !state.visible; $('save').disabled = !state.actionEnabled; $('save').setAttribute('aria-busy', String(state.busy)); $('cancel').hidden = !state.config.showCancelButton; $('cancel').textContent = state.config.cancelText; },
    onState: ({ status }) => { $('mock-status').textContent = `Synthetic host: ${status}`; },
    onLog: entry => { $('mock-status').textContent = `${entry.operation}: ${entry.errorCode ?? 'completed'} · ${entry.durationMs} ms`; } });
  host.setScenario($('outcome').value); host.setEnabled($('enabled').checked);
  frame.src = './?hostOrigin=' + encodeURIComponent(location.origin);
}
$('restart').addEventListener('click', restart);
$('property').addEventListener('change', restart);
$('outcome').addEventListener('change', () => host.setScenario($('outcome').value));
$('theme').addEventListener('change', () => { theme.setLook($('theme').value); host.setTheme($('theme').value); });
$('enabled').addEventListener('change', () => host.setEnabled($('enabled').checked));
$('save').addEventListener('click', () => host.sendAction('save'));
$('cancel').addEventListener('click', () => host.close());
$('close').addEventListener('click', () => host.close());
window.addEventListener('pagehide', () => { host?.dispose(); theme.dispose(); }, { once: true });
restart();
