---
name: dezrez-angular-app
description: Start a small Dezrez welcome app, then help the person choose and build their own idea with the locked Angular starter and supplied Dezrez styling.
metadata:
  version: 0.10.0-angular
---

# Dezrez Angular app

Read `DEZREZ-START-HERE.md`, `README.md`, `AGENTS.md` and the project-root
`references/rezi-styling.md`. Paths here are relative to the project root even
when this skill is copied into an assistant's discovery folder.

## First: build the actual starting application

Keep exactly the two supplied standard Dezrez panels. The first uses the code
icon and heading "{firstname} welcome to Dezrez vibe coding", followed by
"Your starting app is ready. You decide what it becomes." The second uses the
book icon and heading "What happens next", with these numbered instructions:

1. Tell your AI what you would like to make.
2. Ask for one small change at a time.
3. Return to the developer website in Chrome or Edge to see your changes.

These panels are deliberately inside the actual Angular application source,
which the person continues editing. Build and run them; do not stop at an AI
reply, a download or a temporary website message. Keep the same code and local
address across exactly three host locations: Group Hub, Property Hubs and Dashboard.
Location may be chosen independently of business features; there is no separate
welcome location. Do not reduce it to a heading-only page or choose a different
prebuilt app when the presentation changes.
Obtain the first name only from the signed-in negotiator/me API's exact
`FirstName` field through the supplied viewer extension1. Keep the supplied
`public/sdk/viewer.js` import and types. Create the viewer with
`{client,hostOrigin}` before `client.connect()`, call
`await viewer.getCurrentViewer()` only after connection and dispose the viewer
before the core client. It returns only `{firstName}`, rendered as text.
Never ask for a name, hardcode one, read it from a URL, split `ContactName`,
inspect a token or directly call the customer API from this child app.
Keep a generic loading/absent-name welcome and the supplied sign-in/retry state
when the viewer is unavailable. Clear stale identity on connection loss.
Do not add notes, reminders, property fields, example customer data, selectors,
dialog actions or another feature before the person chooses their idea.

Keep the initial `manifest.json` and `public/manifest.json` unchanged:
`surface:'dashboard-widget'`, `permissions:[]` and
`starter:{phase:'welcome',context:'not-chosen'}`. The preview supplies a true null
context. The core connection preserves validated appearance/lifecycle and
SDK0.2.0. The separate viewer read adds no record permission or operation; the
welcome makes no record broker requests, direct customer API calls or storage
reads/writes. Sign-in is required on the developer website. Without its trusted
host, a standalone app cannot obtain the signed-in first name.
`npm run validate` checks this metadata's structure; it is not a record certification
profile, app registration, release approval or permission to publish.

Check Node against `package.json`, then use ordinary `npm ci`,
`npm run check:welcome`, `npm run build`, `npm run validate` and `npm start`.
Use `npm run dev` for rebuilding while editing. Retain the running app process.
Set `DEMO_PARENT_ORIGIN` to the exact developer website origin before the built
preview starts. Verify the local address responds, then give the person that
address and one next action in plain language.

The first visible check is just the signed-in API greeting, correct loaded fonts and the
one current appearance: Light when opened locally on its own, or the host's
effective appearance when embedded. Keep all supplied theme support, but do not
switch themes, run a record/context test matrix, open the optional mock host,
or require certification before the person has chosen their app.

Never open the developer website inside an AI's internal browser. The person
uses their normal Chrome or Edge window. Keep the internal browser for the
local app only when an inspection is actually needed; do not use a local
stand-in host as evidence of a successful developer-website test.

## Then: add features to this same app

Ask what they want to add before changing context or permissions. Presentation
can already be chosen: Property Hubs offers property choices and their actual
marketing roles, Group Hub offers group choices, and Dashboard has no record
chooser. An outer location or record choice does not add access to the initial
app, whose child connection retains null context and empty permissions.
The signed-in agency is supplied by the website; never ask them to choose one.
Do not treat the optional record-notes example as a requirement for their app.

For a requested Dezrez data feature, read the project-root
`references/dezrez-api.md`. Search the website's complete API catalog, read the
matching operation and full request/response contracts, then use
`createApiClient({client,hostOrigin})` from `public/sdk/api.js`. Create it before
core connection, call `api.request({method,path,query,body},{signal})` after
connection and dispose it before the core client. The result is
`{status,headers,data,encoding}`. The full API includes business-record writes
and group APIs under the signed-in developer's existing Systest permissions;
the three older property/note helpers are compatibility, not a product limit.
Do not replace a requested business change with a private app note. Read the
linked property-feature recipe before appending features, preserve existing
entries and never automatically retry a write. Dashboard needs no selected
context to use an appropriate authorized API search or action.

Only when the chosen idea needs record actions, read the project-root
`skills/dezrez-angular-app/references/record-contexts.md`,
`skills/dezrez-angular-app/references/app-details.md` and
`skills/dezrez-angular-app/references/record-example.md`.
`src/app/record-example.component.ts`, its template, `notes-controller.ts` and
`public/examples/record-notes.manifest.json` preserve a later learning example.
Its deliberate local entry is `/?example=records&hostOrigin=...`; the optional
`/mock-host.html` opens that example with fictional data. Neither is startup.
Never overwrite an existing custom app with the example. Merge only the pieces
needed for the person's chosen idea and retain the SDK boundaries.

For an API feature, follow `references/dezrez-api.md`: remove the welcome marker,
add `api:{version:'dezrez.api/1'}` in both manifests and keep empty compatibility
permissions. Do not invent the three old helper permissions or app-note storage.
For the optional compatibility record-note app, replace both draft manifests
with complete accurate declarations; the old normalizer and record checks apply
to that path. Add focused tests appropriate to the requested features.
`npm test` is the optional full developer
suite, including the preserved record example; it is not the first welcome step.
For a chosen API app ready for checks, read `references/api-certification.md`.
The API profile compiles the exact submitted Angular source offline and tests
its declared fictional API workflow in a separate browser guest. Add accurate
owner, usage and test details plus `dezrez-certification.json`; no private-note
storage or legacy note selectors are required. Do not turn a local test or a
fixture into certification, review or publication authority.

## Optional settings for a later chosen widget

Only if the person chooses a widget that needs settings, read the project-root
`references/widget-settings.md`. Import the supplied optional
`public/sdk/widget-settings.js` facade from the component's correct relative
path. Create it before the core client's `connect()` so it observes the
validated connection, then use `onOpen`, `get` and `save` for the current paired
widget. Do not add app IDs, environment branches or broker operations. This
module is separate from core SDK0.2.0. The preview settings are temporary; a
production-host adapter has not been installed or verified. Keep the first
welcome unchanged: no facade import, settings UI or extra permissions.

## Keep the supplied foundations

For every chart you add, use the supplied locked local Chart.js package and read
the project-root `references/charts.md`. Use Exo Soft for axes, labels, legends
and all tooltip text; use New Rubrik for headings. Follow its exact ordered
24-colour palette, stable series identities and semantic theme colours for text,
grids and surfaces. Refresh mounted charts after host themes/fonts change,
respect reduced motion, provide a text/table alternative and destroy charts on
teardown. Keep the first welcome chart-free; do not load chart scripts from a
CDN or add a different chart library.

Preserve the exact locked dependencies, public SDK and validated origin/window/
session binding. Never add packages, custom builders, remote executable scripts,
legacy credential handoff, polling or direct Dezrez/provider calls. A new
capability needs a reviewed profile; never bypass incompatibilities with force
or legacy-peer-deps. Credentials stay in the host.

Use `fontSource:'hosted'` in this child document so the authorised intact kit
loads Exo Soft and New Rubrik. Preserve the standard panels, semantic colours,
reviewed heading icons and global compiled styles in `references/rezi-styling.md`.
Exo 2/Poppins are readable fallbacks, not font parity. Do not copy Adobe binaries.
Keep the icon resources and their existing notices; do not add unreviewed glyphs.

For optional secure local setup, read the project-root
`skills/dezrez-angular-app/references/local-https.md`. Explain the change and ask
before installing trust tools or changing computer trust.

For assistant discovery, copy the canonical skill into this project's
`.agents/skills/dezrez-angular-app` for Codex or `.claude/skills/dezrez-angular-app`
for Claude Code. Update those project copies from the canonical folder; never
change global assistant settings. Keep implementation details in files for the
AI and developers; explain only the next simple action to the person.
