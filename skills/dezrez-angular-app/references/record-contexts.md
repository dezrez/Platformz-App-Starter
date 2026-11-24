# Selected records and marketing roles

This optional later record example uses SDK `0.2.0`, `surface:"record-action"`, matching
`compatibility.surfaces` and `storage.scope:"app-agency-user-context"` with
schemaVersion1. The wire protocol stays `dezrez.partner/1`. Old SDK0.1.0
`property-action` apps remain property-only; adapting an app to new contexts is
a separate app update, not part of installing or updating its skill.

The website supplies one of these minimal contexts:

- Property: `kind:"property"`, `id`, `agencyId`, `address`, `postcode`; optionally
  `marketingRole:{id,type,status?}`. Selling, Letting and Auction retain their
  real type and accessible historical status. A role belongs to that property.
- People group: `kind:"group"`, `id`, `agencyId`, `name`, optional `groupType`.
  It may represent an individual, couple, group, company or team. Its metadata
  does not grant access to members, contacts or a full-group API.
- No selected record: `context:null` on the synthetic dashboard-widget surface,
  with empty permissions and no dialog actions or record requests.

The signed-in agency is chosen automatically by the trusted website/server.
An iframe never chooses an agency, hydrates arbitrary record IDs or invents
metadata. Contexts in the account-free mock/preview are fictional. Real record
selection requires the server's applicable permissions and grant/release.

For a group, display the supplied name/type and load only app-owned state. Do
not call `property.read` or put a group ID into `propertyId`. Property reads
apply only when `context.kind !== 'group'`. State requests use the current
verified session, with no record selector:

```js
const saved = await client.request('appState.get', {}, { signal });
const updated = await client.request('appState.set', {
  note: draft,
  version: saved.version,
}, { signal });
```

Keep the returned version. Load failures offer one explicit read retry and keep
Save disabled. A conflict preserves the draft and requires the user to choose
to load/review the latest note before another save. Never retry writes
automatically or claim host Save succeeded before persistence responds.

State is separate for each app/account/agency/selected record and marketing
role. Two roles of one property are different selections. A group and property
with equal IDs are different selections. The host derives this namespace; the
app must not construct a replacement store or choose another scope.

On every context event, including a role change on the same property, increment
the app's generation, abort pending work, clear the old draft/version and load
the new selection. Check that generation before displaying a reply or completing
a host action. Do not check only property ID. Close, pause and teardown also
invalidate pending actions; Cancel cannot undo a write already dispatched.

Test property-only, Selling, Letting and Auction/history, people groups including
company/team, no-record widget, same-property role changes during reads/Save,
failed note-load retry, conflict, and context loss. Use fictional fixtures and
the same SDK on the website and mock host. Diagnostics contain operation/status,
counts/timing only, never record payloads, note text, credentials or tokens.
Local examples and tests do not establish native-host or certification support;
those require separately reviewed context-conformance evidence.
