# Dezrez Angular Basic

Your first app is a simple welcome with your name and a few instructions. It
starts with no selected record, no data access and no decision about what you
will build. Start with [DEZREZ-START-HERE.md](DEZREZ-START-HERE.md) and talk to
your chosen AI. Bundle **0.6.0-angular** keeps the locked Angular dependency
profile and SDK0.2.0; it changes the starting experience, not the wire contract.

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

The AI puts the person's first name in `configuredFirstName` in
`src/app/app.component.ts`. Optional `?firstName=Ian` is bounded display text,
rendered as text, never context. Without a name the welcome stays friendly.
The SDK handshake is only for host-owned appearance and lifecycle; the welcome
makes no broker requests or direct API/storage calls. Its manifests are a
`dashboard-widget` draft with empty permissions and
`starter:{phase:'welcome',context:'not-chosen'}`. Validation of that draft is a
structural check, not certification, registration or a release.

Check just the welcome, its actual font loading and its one current appearance:
Light on its own locally, or the host's effective appearance when embedded.
The code retains all supported themes. Do not switch themes, choose records or
run the optional record matrix during this first step. Use the developer website
in normal Chrome or Edge, never inside an AI's internal browser.

## Once you choose your app

Tell your AI what you want the app to do and where it belongs. Property Hubs use
properties and their real marketing roles, Groups use groups, and Dashboard has
no selected record. The website derives the agency from sign-in.

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
accurate. A record app needs complete declarations through the supplied shared
normalizer, with the welcome marker removed. No selected record means no record
operation; never invent a record or agency.

For a property or its actual marketing role the example can call property.read,
appState.get and appState.set. A people group uses supplied name/type and its own
app state, never property.read or group members/contacts. Notes are 500 characters,
versioned and separate per record/role. Keep stale-reply rejection, pause/close
cleanup, explicit load retry and conflict draft preservation. Never automatically
retry a write. A manifest grants no authority; credentials stay in the host.

`npm test` runs the full developer suite, including the preserved record example.
Use focused tests and browser checks appropriate to the app the person actually
chooses. This full suite is not a first-welcome requirement.

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

Keep exact dependencies and lockfile; do not add packages, custom builders,
remote executable scripts or API bypasses. New dependencies/capabilities need
a reviewed profile. Never use force/legacy-peer-deps to hide an incompatibility.

After a build, `npm run package` creates `artifacts/app.zip` plus a hash receipt
from built browser files, manifest and notices. The separate source download
contains the clean project and lockfile. The packager excludes development mock
assets and private maintenance notes. Neither ZIP authorises deployment.
The welcome draft cannot be submitted as a certified record app. The current
buildless certification pilot does not support Angular source; an isolated
Angular compiler profile needs independent review. See [COMPATIBILITY.md](COMPATIBILITY.md).

When the chosen app needs app details, use the skill's
[app-details reference](skills/dezrez-angular-app/references/app-details.md).
Keep fictional details explicitly marked for an internal demo; do not invent
real contacts, workload estimates or publication permission.

Optional secure local setup is in the skill's
[local HTTPS guide](skills/dezrez-angular-app/references/local-https.md).
Explain any trust-tool installation or trust change before asking permission.
Keep private values and certificate keys out of the project and submissions.
