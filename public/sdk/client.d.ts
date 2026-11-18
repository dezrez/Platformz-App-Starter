export interface PropertyContext {
  id: string; agencyId: string; address: string; postcode: string;
  price: number | null; bedrooms: number | null; description: string;
}
export interface InitialContext { context: PropertyContext | null; surface?: 'property-action' | 'dashboard-widget'; enabled: boolean; synthetic: boolean; theme: { look: string }; expiresAt?: number; capabilities?: { dialogActions?: boolean }; dialog?: { actionText: string | null; showCancelButton: boolean; cancelText: string }; }
export interface SavedNote { note: string; version: number; }
export interface PartnerClient {
  connect(): Promise<InitialContext>;
  request(operation: 'property.read' | 'appState.get' | 'appState.set', params: object, options?: { signal?: AbortSignal }): Promise<unknown>;
  on(type: string, callback: (payload: any) => void): () => void;
  setActionState(value: { label?: string; enabled?: boolean }): boolean;
  completeAction(actionId: string, result: { success: boolean }): boolean;
  destroy(): void;
  readonly sessionId: string | null;
}
export function createPartnerClient(options: { hostOrigin: string; hostWindow?: Window; eventTarget?: Window; timeoutMs?: number }): PartnerClient;
