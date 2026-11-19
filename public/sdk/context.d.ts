import type { RecordContext } from './client.js';
export const CONTEXT_KINDS: readonly ['property', 'group'];
export type ContextSelection = { kind: 'property'; id: string; marketingRoleId?: string } | { kind: 'group'; id: string };
export function normalizeContextSelection(value: unknown): ContextSelection;
export function recordContextIdentity(context: RecordContext): { kind: 'property' | 'group'; id: string; agencyId: string; marketingRole?: { id: string; type: string } };
export function recordContextKey(context: RecordContext): string;
export function appStateContextId(context: RecordContext): string;
export function contextSelectionFrom(context: RecordContext): ContextSelection;
