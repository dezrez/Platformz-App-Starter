import type { PartnerClient } from './client.js';
export const VIEWER_PROTOCOL: 'dezrez.viewer/1';
export interface CurrentViewer { firstName: string | null; }
export interface ViewerClient { getCurrentViewer(): Promise<CurrentViewer>; destroy(): void; }
export function createViewerClient(options: { client: PartnerClient; hostOrigin: string; hostWindow?: Window; eventTarget?: Window; timeoutMs?: number }): ViewerClient;
