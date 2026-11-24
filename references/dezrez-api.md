# Develop with the complete Dezrez API

Read the current API guide at
<https://developers.dezrez.com/reference/api/README.md> when the person requests
a feature that uses Dezrez data. If using another developer-site origin, resolve
`/reference/api/README.md` and its linked resources against that origin.

Download and search `/reference/api/catalog.json`, then fetch the matching
operation's `documentation` URL. Each topic includes full transitive request
and response contracts. `/reference/api/openapi.json` is the complete schema.
Identify operations by method plus path: names may be duplicated. Read the
linked source-verified workflow recipe where available; do not infer replacement
or deletion semantics merely from the JSON structure.

Use `createApiClient({client,hostOrigin})` from the supplied `sdk/api.js`
(`public/sdk/api.js` in Angular), created before core connection. After the core
connects, call `api.request({method,path,query,body},{signal})`. It returns
`{status,headers,data,encoding}`. Optional `bodyType` and content-negotiation
`headers` support documented text/binary endpoints. Dispose the API facade
before the core client. Keep exact window/origin/session validation and never
put upstream credentials, access tokens or refresh tokens in the app.

This is the full API, including business-record writes, through the signed-in
developer's existing Systest permissions. It is independent of the old three
property/note convenience operations and works without a selected context on
Dashboard. The gateway is fixed to Systest. Credential-management endpoints do
not return tokens to app frames; this does not prevent normal business writes.

When asked to change a property or other business record, implement that API
action rather than silently storing a substitute app note. Preserve existing
values and record identity, handle API validation and authorization, and never
automatically retry a write. In particular, read the linked property-features
recipe before appending a feature: a full desired collection replaces the
existing collection, so a one-item payload can remove existing entries.

The first welcome still has no business feature or record operation. Add only
the features requested later. No framework, dependency, theme/context matrix,
certification or release change is implied by discovering an API endpoint.

For the chosen API feature, remove the `starter` marker and add
`api:{version:'dezrez.api/1'}` to the manifest (both copies in Angular). Keep
`permissions:[]` and `providerDestinations:[]`, actual identity/name/version and
the usual `protocol:'dezrez.partner/1'`, `host:'rezi'` and chosen surface. The
local checker accepts Dashboard, record-action or existing property-action and
optional documented dialog labels. Do not add fake note/property permissions,
storage, usage or certification selectors to make an API app compile. This
development declaration does not grant authority or certify the new API path.

When the person is ready for checks and release, read the project-root
`references/api-certification.md` and the website's current API certification
guide. Add the actual owner/usage details and fictional test workflow, without
fake note storage or legacy selectors. Keep development, certification, human
approval and Systest publishing as distinct outcomes.
