# Charts in a chosen Dezrez app

Use **Chart.js** for every chart you add. Charts are optional later app features;
do not add one to the supplied two-panel welcome. Keep the app's purpose, host
connection, permissions and data boundaries when adding a requested chart.

The current Angular starter supplies the reviewed, exactly locked **Chart.js
4.6.2** dependency. Import it from that local package and bundle it with the app; do not
load Chart.js or another chart library from a CDN. The JavaScript compatibility
starter is a dependency-free legacy profile: prefer the current Angular starter
for chart development, preserving the existing app when planning any migration.
Do not add an unreviewed package or remote script to bypass its profile.

## Supplied chart helpers

The framework-independent `sdk/charts.js` helper is `public/sdk/charts.js` in the
Angular starter. It does not import Chart.js or change global Chart.js defaults.
For a requested chart in `src/app/`, import its local package and helpers:

```ts
import Chart from 'chart.js/auto';
import {
  DEZREZ_CHART_COLOURS, chartColour, createChartOptions, refreshChartAppearance,
} from '../../public/sdk/charts.js';
```

`DEZREZ_CHART_COLOURS` contains the exact ordered palette below.
`chartColour(zeroBasedSeriesIndex)` cycles that palette; keep an identity's index
stable. Pass `createChartOptions({document, window, type: 'bar'})` as the chart's
options, using the actual chart type. Add the requested chart's own data and scale
settings without overriding its typography, theme or reduced-motion options.
For pie/doughnut charts, set the dataset's `backgroundColor` to an array of
category colours from the stable category mapping; one dataset colour does not
assign separate slice colours.

After applying a host theme or receiving a font-ready change, call
`await refreshChartAppearance(chart, {document, window, type: 'bar'})`, again
using the actual type. It waits for `document.fonts.ready`, updates appearance
options while retaining the chart's data and scale configuration, and calls
`chart.update('none')`. Keep the existing chart instance and data mapping. Do not
add a timer/polling loop, mutate global defaults or restart the host to repaint.
The helper does not replace verified font loading, app lifecycle cleanup or
accessible text alternatives.

## Typography and theme

Read [the styling guide](rezi-styling.md). Use actual **Exo Soft** for axis ticks,
axis labels, data labels, legends and every tooltip text style, including tooltip
titles. Use actual **New Rubrik 600** for the chart's heading and an optional
Chart.js title/subtitle. A normal panel heading keeps its appropriate supplied
decorative icon and accessible heading text. Do not use Chart.js default fonts.

Keep the intact authorised hosted font kit in the child document. Wait for its
verified loaded faces and `document.fonts.ready` before measuring a chart, then
resize/redraw if fonts finish loading after an initial fallback render. Declared
family names, Exo 2 and Poppins alone do not establish font parity; retain readable
fallbacks and report unavailable fonts honestly. Never redistribute font binaries.

Canvas pixels do not inherit changing CSS variables. Resolve the effective
`--rezi-modern-text`, `--rezi-modern-muted`, `--rezi-modern-heading`,
`--rezi-modern-border`, `--rezi-modern-border-strong`,
`--rezi-modern-surface` and `--rezi-modern-font-scale` values in the app document
when creating or refreshing chart options. Keep axes, labels and legend text
readable; use semantic border colours for grids/axis borders and semantic
surface/text/border colours for tooltips and the surrounding panel. Preserve
High Contrast's 1.2 type scale and stronger boundaries. Never hard-code Light
text, grids or tooltip surfaces into Dark or High Contrast.

Apply the host's validated theme through the existing theme controller. Refresh
each mounted chart after the theme is applied, without recreating the host
session, changing the shared preference or fetching data again merely to repaint.
Keep the series colours below stable across theme switches; theme changes affect
the supporting text, grids, borders and surfaces.

## Ordered series colours

Assign these exact colours in this order, starting with the first series or
category. Keep one stable identity-to-colour mapping across filtering, sorting,
refreshes and themes; do not reassign colours from the current visible index.
For a single-series bar/pie chart whose categories need separate colours, use the
same ordered rule for category identities. After 24 identities, reuse the order
with distinguishable labels, markers or line patterns; never invent a new palette.

```text
#51A3CE, #66C095, #D49757, #7687C8, #B45DAE, #CF634A,
#DBC270, #E29B8C, #70B6DB, #DB70DB, #8D6E63, #86C232,
#FF6961, #FFB347, #90BE6D, #58B19F, #4786CA, #BA68C8,
#FFCA3A, #FA7070, #FF8C69, #FFC1CC, #A0D6FF, #83C5BE
```

These are data colours, not semantic success/error status colours. Do not use
colour alone to identify a series or communicate a result. Preserve the exact
base colours and distinguish neighbouring series with labels, borders, markers
or line patterns where contrast needs help.

## Lifecycle, accessibility and focused checks

Create charts only after their canvas exists. Give the responsive chart a sized,
flexible parent so it fits its actual widget/dialog without clipping labels.
Update the mounted instance for data changes. Destroy it before reusing its
canvas or unmounting, and remove theme, font and media-query listeners. Ignore
font/data completions after teardown and stale results after a context change.
Keep existing cancellation and SDK teardown behavior.

Respect `prefers-reduced-motion`: disable chart animation when requested and
refresh that setting if the preference changes. Do not animate every host-theme
refresh. Loading, empty and error states need readable text rather than an empty
or misleading plot; distinguish missing values from zero.

Give each canvas an accessible name and a nearby text summary or accessible
data table containing the chart's useful values. Interactive information must
also be available without hovering the canvas; a tooltip alone is insufficient.
Use normal keyboard-accessible controls when a chart supports filtering or
selection. Keep units, periods and series labels clear.

For a requested chart feature, browser-check Light, Dark and High Contrast at
relevant narrow/wide sizes, actual loaded fonts, live theme refresh, long labels,
loading/empty/error states, reduced motion and the text/table alternative. Check
mount/unmount and data refresh without duplicate charts/listeners. These focused
chart checks apply when a chart is chosen; they do not expand the first welcome
into a theme/context test matrix or certify/publish an app.
