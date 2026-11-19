/** Public record identities only. These helpers never grant record access. */
export const CONTEXT_KINDS = Object.freeze(['property', 'group']);
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,120}$/.test(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const kindFor = context => context?.kind === undefined ? 'property' : context.kind;

/** A browser may request identifiers; the trusted server resolves every record. */
export function normalizeContextSelection(value) {
  if (!record(value) || !CONTEXT_KINDS.includes(value.kind) || !identifier(value.id)) throw new TypeError('Choose a property or people group.');
  const keys = value.kind === 'property' ? ['kind', 'id', 'marketingRoleId'] : ['kind', 'id'];
  if (Object.keys(value).some(key => !keys.includes(key)) || value.marketingRoleId !== undefined && !identifier(value.marketingRoleId)) throw new TypeError('Use only the selected record and its marketing role.');
  return { kind: value.kind, id: value.id, ...(value.marketingRoleId === undefined ? {} : { marketingRoleId: value.marketingRoleId }) };
}

export function recordContextIdentity(context) {
  const kind = kindFor(context);
  if (!record(context) || !CONTEXT_KINDS.includes(kind) || !identifier(context.id) || !identifier(context.agencyId)) throw new TypeError('A verified record context is required.');
  const role = context.marketingRole;
  if (kind === 'group' && role !== undefined && role !== null) throw new TypeError('A people group cannot have a property marketing role.');
  if (role !== undefined && role !== null && (!record(role) || !identifier(role.id) || typeof role.type !== 'string' || !role.type.trim() || role.type.length > 80 || /[\x00-\x1f\x7f]/.test(role.type))) throw new TypeError('A verified property marketing role is required.');
  return { kind, id: context.id, agencyId: context.agencyId,
    ...(kind === 'property' && role ? { marketingRole: { id: role.id, type: role.type } } : {}) };
}

/** Includes role identity so a role change on the same property ends old work. */
export function recordContextKey(context) {
  const identity = recordContextIdentity(context);
  return JSON.stringify([identity.kind, identity.agencyId, identity.id,
    ...(identity.marketingRole ? [identity.marketingRole.id, identity.marketingRole.type] : [])]);
}

/** Preserve old property-note keys; typed tuples cannot collide with valid IDs. */
export function appStateContextId(context) {
  const identity = recordContextIdentity(context);
  if (identity.kind === 'group') return JSON.stringify(['group', identity.id]);
  if (identity.marketingRole) return JSON.stringify(['property', identity.id, 'marketing-role', identity.marketingRole.id]);
  return identity.id;
}

export function contextSelectionFrom(context) {
  const identity = recordContextIdentity(context);
  return { kind: identity.kind, id: identity.id,
    ...(identity.marketingRole ? { marketingRoleId: identity.marketingRole.id } : {}) };
}
