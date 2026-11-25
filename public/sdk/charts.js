/** Optional Chart.js appearance helpers. No Chart.js import or global defaults. */
export const DEZREZ_CHART_COLOURS = Object.freeze([
  '#51A3CE', '#66C095', '#D49757', '#7687C8', '#B45DAE', '#CF634A',
  '#DBC270', '#E29B8C', '#70B6DB', '#DB70DB', '#8D6E63', '#86C232',
  '#FF6961', '#FFB347', '#90BE6D', '#58B19F', '#4786CA', '#BA68C8',
  '#FFCA3A', '#FA7070', '#FF8C69', '#FFC1CC', '#A0D6FF', '#83C5BE',
]);

/** Keep an identity's index stable when filtering or reordering its data. */
export function chartColour(index) {
  if (!Number.isSafeInteger(index) || index < 0) throw new TypeError('Use a non-negative integer colour index.');
  return DEZREZ_CHART_COLOURS[index % DEZREZ_CHART_COLOURS.length];
}

const bodyFamily = '"exo-soft", "Exo 2", Arial, sans-serif';
const headingFamily = '"new-rubrik", Poppins, Arial, sans-serif';
const fallbacks = {
  light: ['#23334a', '#61718a', '#1c4377', '#d9e2ee', '#a6b6ca', '#ffffff', 1],
  dark: ['#e5edf7', '#a4b5cc', '#d6e6fd', '#34455c', '#60758f', '#192434', 1],
  'high-contrast': ['#ffffff', '#dce8f5', '#ffffff', '#829db7', '#c7dff5', '#080e16', 1.2],
};

function appearance({ document: doc = globalThis.document, window: win = doc?.defaultView ?? globalThis.window } = {}) {
  const element = doc?.body ?? doc?.documentElement;
  const look = element?.getAttribute?.('data-rezi-application-look');
  const fallback = fallbacks[look] ?? fallbacks.light;
  let style;
  try { if (element) style = win?.getComputedStyle?.(element); } catch { /* Use semantic theme fallbacks. */ }
  const token = (name, index) => style?.getPropertyValue(`--rezi-modern-${name}`).trim() || fallback[index];
  const rawScale = Number(token('font-scale', 6));
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : fallback[6];
  let reducedMotion = false;
  try { reducedMotion = Boolean(win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches); } catch { /* No media query API. */ }
  return {
    text: token('text', 0), muted: token('muted', 1), heading: token('heading', 2),
    border: token('border', 3), strong: token('border-strong', 4), surface: token('surface', 5),
    scale, reducedMotion,
  };
}

function fonts(a) {
  return {
    body: { family: bodyFamily, size: 14 * a.scale, weight: 400, lineHeight: 1.4 },
    emphasis: { family: bodyFamily, size: 14 * a.scale, weight: 600, lineHeight: 1.4 },
    heading: { family: headingFamily, size: 18 * a.scale, weight: 600, lineHeight: 1.4 },
  };
}

function cartesianScale(a, f) {
  return {
    ticks: { color: a.muted, font: { ...f.body } },
    title: { color: a.text, font: { ...f.body } },
    grid: { color: a.border }, border: { color: a.strong },
  };
}

function radialScale(a, f) {
  return {
    ticks: { color: a.text, font: { ...f.body }, backdropColor: a.surface },
    pointLabels: { color: a.text, font: { ...f.body } },
    grid: { color: a.border }, angleLines: { color: a.strong },
  };
}

/** Resolve canvas colours/fonts from this app's current semantic theme. */
export function createChartOptions(options = {}) {
  const a = appearance(options), f = fonts(a), type = options.type ?? 'bar';
  const result = {
    responsive: true, maintainAspectRatio: false, color: a.text, font: { ...f.body },
    animation: a.reducedMotion ? false : { duration: 200 },
    transitions: { active: { animation: { duration: a.reducedMotion ? 0 : 200 } } },
    plugins: {
      colors: { enabled: false },
      legend: { labels: { color: a.text, font: { ...f.body } }, title: { color: a.text, font: { ...f.emphasis } } },
      title: { color: a.heading, font: { ...f.heading } },
      subtitle: { color: a.heading, font: { ...f.heading } },
      tooltip: {
        backgroundColor: a.surface, borderColor: a.strong, borderWidth: 1,
        titleColor: a.text, bodyColor: a.text, footerColor: a.text,
        titleFont: { ...f.emphasis }, bodyFont: { ...f.body }, footerFont: { ...f.body },
      },
    },
  };
  if (['radar', 'polarArea'].includes(type)) result.scales = { r: radialScale(a, f) };
  else if (!['pie', 'doughnut'].includes(type)) result.scales = { x: cartesianScale(a, f), y: cartesianScale(a, f) };
  return result;
}

function merge(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    // Preserve deliberately disabled plugins, titles, ticks and grids.
    if (target[key] === false && value && typeof value === 'object') continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      merge(target[key], value);
    } else target[key] = value;
  }
}

/** Repaint after a theme/font/motion change; do not fetch data or replace it. */
export async function refreshChartAppearance(chart, options = {}) {
  if (!chart || typeof chart.update !== 'function') throw new TypeError('Supply a mounted Chart.js instance.');
  const doc = options.document ?? globalThis.document;
  try { await doc?.fonts?.ready; } catch { /* A failed font load still permits readable fallbacks. */ }
  if (chart.canvas === null || chart.ctx === null) return false;
  const type = options.type ?? chart.config?.type ?? 'bar';
  const patch = createChartOptions({ ...options, type });
  // Use this instance's raw configuration, avoiding resolved global-default proxies.
  const target = chart.config?.options ?? chart.options;
  if (!target || typeof target !== 'object') throw new TypeError('The chart has no options.');
  delete patch.responsive;
  delete patch.maintainAspectRatio;
  delete patch.scales;
  merge(target, patch);
  if (target.scales && typeof target.scales === 'object') {
    const a = appearance(options), f = fonts(a);
    for (const [id, scale] of Object.entries(target.scales)) {
      if (!scale || typeof scale !== 'object') continue;
      merge(scale, scale.axis === 'r' || id === 'r' || scale.type === 'radialLinear' ? radialScale(a, f) : cartesianScale(a, f));
    }
  }
  chart.update('none');
  return true;
}
