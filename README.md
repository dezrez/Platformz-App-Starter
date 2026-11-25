# Dezrez Angular Basic

Your actual starting application is the supplied welcome with your name and a
small What happens next panel. Build and run this source, then edit the same
app with your AI. It starts with no record data access or business features.
Start with [DEZREZ-START-HERE.md](DEZREZ-START-HERE.md) and talk to
your chosen AI. Bundle **0.10.0-angular** keeps the locked Angular dependency
profile and core SDK0.2.0, with a separate token-free viewer extension1.

## First welcome: details for your AI or a developer

Use a supported Node version from `package.json`: 22.22.3 or newer 22.x,
24.15.0 or newer 24.x, or 26.x. The reviewed toolchain is 22.23.5. Angular does
not need to be installed globally. From this extracted folder:

```text
npm ci
npm run check:welcome
npm run build
npm run validate
npm start
```

`npm start` serves the built app at **http://127.0.0.1:4200/**. Set
`DEMO_PARENT_ORIGIN` to the exact developer website origin before starting it.
`localhost` and `127.0.0.1` are different origins. Keep the process running.
For automatic rebuilding during edits use `npm run dev` instead.

The greeting obtains only `{firstName}` from the signed-in negotiator/me API's
exact `FirstName` field through the supplied viewer extension. Preserve its
`createViewerClient({client,hostOrigin})` before `client.connect()`, then call
`getCurrentViewer()` only after connection. Dispose the viewer before the core
client. Keep the supplied `public/sdk/viewer.js` import and types. Never ask for,
hardcode or take a name from a URL, split `ContactName` or inspect a token.
Render the name as text. Keep a generic welcome during loading or absent FirstName,
and sign-in/retry guidance when unavailable. The developer website requires sign-in;
a standalone app without its trusted host cannot obtain the signed-in name.

The core SDK keeps validated host appearance and lifecycle. The separate viewer
read grants no record access; the app makes no record broker requests, direct
customer API calls or storage reads/writes. Its manifests are a
`dashboard-widget` with empty permissions and
`starter:{phase:'welcome',context:'not-chosen'}`. Validation of that initial metadata is a
structural check, not certification, registration or a release.

Check just the signed-in API greeting, its actual font loading and its one current appearance:
Light on its own locally, or the host's effective appearance when embedded.
The code retains all supported themes. Do not switch themes, choose records or
run the optional record matrix during this first step. Use the developer website
in normal Chrome or Edge, never inside an AI's internal browser.
Keep the two supplied panels in every preview location. The first has the code
icon, heading "{firstname} welcome to Dezrez vibe coding" and body
"Your starting app is ready. You decide what it becomes." The second has the
book icon, heading "What happens next" and these numbered instructions:

1. Tell your AI what you would like to make.
2. Ask for one small change at a time.
3. Return to the developer website in Chrome or Edge to see your changes.

These panels belong in the actual Angular application source, not just an AI
reply or a temporary developer-website message. Do not remove the body
copy or instructions, choose a prebuilt app from the selected location, or add
records, notes, forms, settings or other functionality before the person asks.

## Choose its location, then add features when ready

There are exactly three host locations: Group Hub, Property Hubs and Dashboard.
They show the same application code at the same local address. Choose the
surrounding presentation independently of features; there is no separate welcome
location. Property Hubs offers properties and their real marketing roles, Group Hub
offers groups, and Dashboard has no record chooser. These outer choices do not
give the starting app record data access. The website derives the agency from
sign-in when you later use supported connected features.

Tell your AI what you want to add to this same app. Add context and operations
only when the requested features need them.

Your AI can discover the complete Dezrez API through the
[API guide](references/dezrez-api.md), including endpoint contracts and
source-verified workflow recipes. The supplied `public/sdk/api.js` facade
supports business reads and writes with your signed-in Systest permissions.
The older property/note helpers below are compatibility examples, not the API's
limit. A requested business-record change belongs in Dezrez, not a substitute
private note. Dashboard can use APIs without a host-selected record.

The record-notes example is retained only as later learning material:

- `src/app/record-example.component.ts` and its template render the record UI.
- `src/app/notes-controller.ts` contains guarded SDK calls and lifecycle cleanup.
- `public/examples/record-notes.manifest.json` declares that example's operations.
- `/mock-host.html` opens that explicit example with fictional records and page-memory notes.
- `/?example=records&hostOrigin=...` is its deliberate local entry, not startup.

Read the skill's [record-example guide](skills/dezrez-angular-app/references/record-example.md)
and [record-context contract](skills/dezrez-angular-app/references/record-contexts.md)
only when the chosen app needs them. Do not overwrite an existing custom app
with this example. Adapt the necessary pieces and keep both app manifest copies
accurate. That optional compatibility record-note example needs complete
declarations through the supplied shared normalizer, with the welcome marker
removed. Full API features instead use the local API declaration documented in
`references/dezrez-api.md`, with empty helper permissions and no invented note
feature. Never invent a record or agency; full API features may use an actual
authorized API result without a host-selected record.

For a property or its actual marketing role the example can call property.read,
appState.get and appState.set. A people group uses supplied name/type and its own
app state in this example; full group APIs use the separate API facade. Notes are 500 characters,
versioned and separate per record/role. Keep stale-reply rejection, pause/close
cleanup, explicit load retry and conflict draft preservation. Never automatically
retry a write. A manifest grants no authority; credentials stay in the host.

`npm test` runs the full developer suite, including the preserved record example.
Use focused tests and browser checks appropriate to the app the person actually
chooses. This full suite is not a first-welcome requirement.

## Optional settings for a later widget

Only if the widget you choose needs settings, follow the project-root
[widget-settings guide](references/widget-settings.md). The supplied optional
`public/sdk/widget-settings.js` and its type declaration are separate from
core SDK0.2.0. Create the facade before the core client connects; use its
`onOpen`, `get` and `save` methods without app IDs or environment branches.
Preview settings are temporary. A production-host adapter has not been
installed or verified, so this does not establish production availability.
The first welcome does not import the facade or display settings. It keeps the
same two welcome/instruction panels in every location until you ask for a feature.

## Styling

Read the project-root [layout and styling guide](references/rezi-styling.md).
Use supplied standard panels and heading icons, semantic tokens, global compiled
CSS and host-owned appearance. The child document uses `fontSource:'hosted'`
with the authorised intact kit for **Exo Soft** and **New Rubrik**. The theme
controller verifies real loaded faces and reports `data-fonts="rezi"`; a CSS
family name alone is not evidence. Exo 2/Poppins remain readable fallbacks and
carry their bundled notices. Do not redistribute Adobe font binaries or add an
unreviewed icon pack. Strict preview CSP already permits the exact kit sources.

## Build and release boundaries

For a later requested chart, follow [the chart guide](references/charts.md).
Use the supplied exactly locked local Chart.js 4.6.2 package, Exo Soft for
axes/labels/legends/tooltips, New Rubrik for headings, the exact ordered series
palette and semantic theme colours for text, grids and surfaces. Keep live theme
refresh, font-ready redraw, reduced motion, cleanup and a text/table alternative.
Charts are not part of the first welcome. Do not use a CDN or another chart library.

Keep exact dependencies and lockfile; do not add packages, custom builders,
remote executable scripts or API bypasses. New dependencies/capabilities need
a reviewed profile. Never use force/legacy-peer-deps to hide an incompatibility.

After a build, `npm run package` creates `artifacts/app.zip` plus a hash receipt
from built browser files, manifest and notices. The separate source download
contains the clean project and lockfile. The packager excludes development mock
assets and private maintenance notes. Neither ZIP authorises deployment.
The initial welcome metadata cannot be submitted as a certified app. After a
requested API feature is developed, follow the
[API certification guide](references/api-certification.md). It describes the
locked offline compiler, separate fictional browser workflow and exact-artifact
Systest release process. A source declaration or local build does not certify,
approve or publish it. See [COMPATIBILITY.md](COMPATIBILITY.md).

When the chosen app needs app details, use the skill's
[app-details reference](skills/dezrez-angular-app/references/app-details.md).
Keep fictional details explicitly marked for an internal demo; do not invent
real contacts, workload estimates or publication permission.

Optional secure local setup is in the skill's
[local HTTPS guide](skills/dezrez-angular-app/references/local-https.md).
Explain any trust-tool installation or trust change before asking permission.
Keep private values and certificate keys out of the project and submissions.
