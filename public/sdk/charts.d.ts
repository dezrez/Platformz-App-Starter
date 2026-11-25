import type { Chart, ChartOptions, ChartType } from 'chart.js';

export const DEZREZ_CHART_COLOURS: readonly string[];
/** Use a stable zero-based index for each series/category identity. */
export function chartColour(index: number): string;
export interface ChartAppearanceEnvironment<T extends ChartType = ChartType> {
  document?: Document;
  window?: Window;
  type?: T;
}
/** Does not change global Chart.js defaults or assign dataset colours. */
export function createChartOptions<T extends ChartType = 'bar'>(options?: ChartAppearanceEnvironment<T>): ChartOptions<T>;
/** False means the chart was destroyed while fonts were loading. */
export function refreshChartAppearance<T extends ChartType>(chart: Chart<T>, options?: ChartAppearanceEnvironment<T>): Promise<boolean>;
