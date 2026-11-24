export type WidgetSettingsJson = null | boolean | number | string | WidgetSettingsJson[] | { [key: string]: WidgetSettingsJson };
export type WidgetSettings = { [key: string]: WidgetSettingsJson };
export const WIDGET_SETTINGS_PROTOCOL: 'dezrez.widget-settings/1';
export interface WidgetSettingsCoreClient {
  readonly sessionId: string | null;
  on(type: string, callback: (payload: any) => void): () => void;
}
export interface WidgetSettingsClient {
  get(): Promise<WidgetSettings | null>;
  save(settings: WidgetSettings): Promise<WidgetSettings | null>;
  onOpen(callback: () => void): () => void;
  dispose(): void;
}
/** Construct before core.connect(), register onOpen, and dispose before core.destroy(). */
export function createWidgetSettingsClient(options: {
  client: WidgetSettingsCoreClient;
  hostOrigin: string;
  hostWindow?: Window;
  eventTarget?: Window;
  timeoutMs?: number;
}): WidgetSettingsClient;
export interface WidgetSettingsAvailability { hasSetup: boolean; ready: boolean; }
export interface WidgetSettingsHost {
  openSettings(): boolean;
  /** Call after core connection, enabled/visibility, session or close changes. */
  sync(): WidgetSettingsAvailability;
  dispose(): void;
}
/** Optional host feature, not a grant of record/API or server-storage access. */
export function createWidgetSettingsHost(options: {
  targetWindow: Window;
  targetOrigin: string;
  eventTarget?: Window;
  session: () => { id: string | null; surface: string; connected: boolean; enabled: boolean } | null;
  adapter: {
    get(): WidgetSettings | null | Promise<WidgetSettings | null>;
    save(settings: WidgetSettings): WidgetSettings | null | Promise<WidgetSettings | null>;
  };
  onAvailability?: (value: WidgetSettingsAvailability) => void;
}): WidgetSettingsHost;
