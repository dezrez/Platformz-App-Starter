export const API_PROTOCOL: 'dezrez.api/1';
export const API_MAX_REQUEST_BYTES: number;
export const API_MAX_RESPONSE_BYTES: number;
export interface ApiRequest {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  /** Relative to the fixed Systest API, for example `property/123`. */
  path: string;
  query?: Record<string, string | number | boolean | null | (string | number | boolean | null)[]>;
  body?: unknown;
  bodyType?: 'json' | 'text' | 'base64';
  headers?: { Accept?: string; 'Content-Type'?: string; accept?: string; 'content-type'?: string };
}
export interface ApiResponse<T = unknown> {
  /** The original API status. Check this before treating a write as successful. */
  status: number;
  headers: Record<string, string>;
  data: T;
  encoding: 'json' | 'text' | 'base64' | 'empty';
}
export function normalizeApiRequest(input: ApiRequest): ApiRequest;
export function createApiClient(options: {
  client: { readonly sessionId: string | null; on(type: string, callback: (value: any) => void): () => void };
  hostOrigin: string; hostWindow?: Window; eventTarget?: Window; timeoutMs?: number;
}): {
  /** A single attempt. Never automatically retries a write. */
  request<T = unknown>(request: ApiRequest, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>>;
  destroy(): void;
};
export function createApiHost(options: {
  targetWindow: Window; targetOrigin: string; eventTarget?: Window;
  session(): { id: string; connected: boolean; enabled: boolean; authenticated: boolean; identityKey: string; appId?: string; apiAllowed?: boolean };
  requestApi(path: string, options?: unknown): Promise<any>;
  onLog?(event: unknown): void;
}): { sync(): void; dispose(): void };
