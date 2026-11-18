# Rezi Angular Basic

A working Angular app for reading the selected property and saving an app-owned note. It uses the same `dezrez.partner/1` SDK as the developer website. The included mock host uses fictional records and needs no account. Rezi sign-in and credentials stay in the developer website.

Start with [REZI-START-HERE.md](REZI-START-HERE.md). You can give that file to Codex, Claude Code or another coding assistant.

## Run the app

Install Node.js **22.22.3 or a newer 22.x release**, **24.15.0 or a newer 24.x release**, or **26.x**. This starter was checked using Node.js **22.23.5**. Your assistant can check your version with `node --version`. You do not need to install Angular globally.

From this extracted folder, run:

```text
npm ci
npm test
npm run build
npm run validate
npm start
```

Open **http://127.0.0.1:4200/mock-host.html** to see the app with fictional records. Change the property, response, theme or enabled setting. The host footer’s Save button stays disabled until the app is ready. Save completes one correlated action and closes the session only after success; an error keeps it open. The app’s own Save note button saves without requesting a close. Cancel closes without claiming that an already-sent write was undone. Mock notes stay in page memory and clear on refresh. The app itself is **http://127.0.0.1:4200/**; opening it alone does not supply a property or a host session.

The mock host starts with **No record (dashboard widget)**. That mode supplies a
real null context, makes no property/note API requests and has no dialog footer.
Choose a property to open the record dialog and notes example. Changing surface
starts a fresh host/session; the app clears record drafts instead of inventing a
property or agency ID. Production/registered access remains the property-action
pilot; the synthetic widget preview does not enable production widgets.

For automatic rebuilds while editing, use `npm run dev` instead of `npm start`. The production preview from `npm start` serves only the built browser files under a strict Content Security Policy. Its server never exposes your source, skills, lockfile or local settings.

## Pair with the developer website

Keep the local app running. In the website choose **Open my app for testing** and paste **http://127.0.0.1:4200/**. The website supplies `hostOrigin` and the authorized context. For the production preview, set `DEMO_PARENT_ORIGIN` to the exact website origin before `npm start`; your assistant should do this for you. The default is `http://127.0.0.1:4173`. `localhost` and `127.0.0.1` are different origins.

The app never receives a Rezi access or refresh token. A manifest requests operations; it does not grant access. The supported operations are `property.read`, `appState.get` and `appState.set`. Notes are limited to 500 characters and saves include the current version. A conflict preserves your draft and explains how to reopen the latest saved version. The app stops new work while paused, hidden or closed, cancels pending work on context changes and discards stale replies. Saves are never retried automatically.

Optional `manifest.dialog` describes the primary label (`actionText`, or `null` for no primary button), Cancel visibility (`showCancelButton`) and Cancel label (`cancelText`). Labels are plain text, 1–30 characters. Only a host advertising `capabilities.dialogActions` supports `setActionState` and `completeAction`; the SDK returns `false` without sending these messages to older hosts. The app can update its primary label/readiness, while the host owns Cancel visibility and enforces pause, hiding, pending work and the current correlated action. Keep the sample’s exact action ID and success/error completion handling.

## What to change

- `src/app/app.component.html`: the screen and accessible labels.
- `src/app/notes-controller.ts`: the app behavior and SDK calls.
- `src/styles.css`: app-specific layout, using the existing Rezi classes and semantic tokens.
- `manifest.json`: your app name, ID and version. Keep `public/manifest.json` synchronized for the local mock host.
- `src/app/*.spec.ts`: focused Angular and behavior tests.

Keep the supplied SDK and locked dependency profile. Do not add packages, custom Angular builders, executable configuration, runtime remote scripts or arbitrary API requests. Ask for a reviewed profile update when a feature requires more dependencies. This preserves a reproducible build and the planned offline certification boundary.

## Themes and resources

Light, Dark and High Contrast come from the effective host theme. The app does not replace it with a localhost preference. High Contrast uses the 1.2 text scale and growing controls. Field focus is orange; standard headings retain the source-verified Rezi icons and readable text. Global compiled CSS avoids Angular component-style injection under the strict preview policy.

The starter includes the same reviewed Rezi icon stylesheet/font published by the developer website. Its relative font URL is bundled by Angular into the immutable app, so it makes no icon-resource request to another origin. `fontSource:'bundled'` explicitly selects the supplied Exo 2/Poppins fallback faces and avoids hosted type-kit requests. Actual successful loading reports `data-fonts="bundled"`; it does not claim Exo Soft/New Rubrik parity. Keep the font notices in `public/assets/fonts`. No Adobe font binaries are included. See [COMPATIBILITY.md](COMPATIBILITY.md) for current delivery gates.

## Package and support

After a production build, `npm run package` creates `artifacts/app.zip` and a file/hash receipt. It packages the exact compiled app bytes, manifest and dependency notices, excluding the development mock host and fixtures. It does not deploy them. The separately distributed source ZIP includes this entire clean project and reproducible lockfile, without dependency folders, private history or deployment settings. You may initialize your own new Git repository in the extracted folder.

Passing local tests is development feedback. The current production certification pilot supports buildless static sources; the Angular source build profile requires a separately reviewed isolated worker and policy. Do not submit compiled output as if it were the original source, claim certification or publish an app automatically. Human approval must bind the exact certified artifact before an authorized production release.

For help, use the support guidance in the developer website. Share the command, safe error code and a minimal fictional example; keep customer data and credentials out of reports. Keep the MIT license and bundled third-party notices with redistributed code. Compatibility and dependency advisories are recorded in [COMPATIBILITY.md](COMPATIBILITY.md).
