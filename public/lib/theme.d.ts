export interface ThemeController { readonly look: string; setLook(look: string, options?: { persist?: boolean }): boolean; dispose(): void; }
export function createThemeController(options: { document: Document; window: Window; hostOwned?: boolean; portalOwned?: boolean; initialLook?: string; fontSource?: 'hosted' | 'bundled'; onChange?: (value: object) => void }): ThemeController;
