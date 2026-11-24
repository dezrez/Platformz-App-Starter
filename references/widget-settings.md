# Settings inside a dashboard widget

Use this optional guide only after the person has chosen a dashboard widget
feature that needs settings. The first welcome app keeps its welcome message,
short starting-app message and three simple next steps. It has no settings form,
stored values or extra requests.
Ask what should be configurable before adding controls or defaults.

The cog in a widget's header opens **that widget's own settings panel**. It does
not open the developer website's Test settings. Keep the panel in the child app,
using the supplied Dezrez panels, heading icons, fields and buttons from the
project-root `references/rezi-styling.md`. The surrounding host owns the cog and
the widget frame. Normal app content can return after Save or Cancel.

## One app API

The optional `sdk/widget-settings.js` facade has these methods:

| Method | Behavior |
| --- | --- |
| `createWidgetSettingsClient({client, hostOrigin})` | Binds settings to the same core client and exact parent origin. Create it before `client.connect()`. |
| `settings.onOpen(callback)` | Registers the app's own open-panel callback and returns an unsubscribe function. Register it before the core connection. |
| `await settings.get()` | Returns the saved plain object, or null when nothing has been saved. |
| `await settings.save(plainObject)` | Saves a plain JSON object and returns the host's saved object or null. |
| `settings.dispose()` | Cancels optional work/listeners and withdraws settings registration from the host. It does not destroy the core client or erase committed settings. |

Settings must have a plain object at the root, containing only finite JSON
values. The encoded object is limited to 16,384 UTF-8 bytes and a maximum depth
of 12. Functions, accessors, cycles, non-finite numbers and other executable or
non-JSON values are rejected. Nested JSON objects and arrays are allowed within
those bounds. Keep an honest error and preserve the draft if validation fails.

The application methods do not take a widget ID, app ID, API URL, credential or
environment choice. Do not invent an ID, inspect tokens, branch between local
and production URLs, call a direct settings endpoint, or add a manual storage
fallback. The host adapter derives the namespace and effective access. Keep the
normal core SDK's exact origin, parent-window and session checks.

In the JavaScript starter use `./sdk/widget-settings.js`. In the Angular starter
the same module is at `../../public/sdk/widget-settings.js` when imported from
`src/app/`. Use the existing core client rather than making a second one.

## Wiring a chosen settings panel

This example shows where your own form functions fit; those functions belong to
your chosen feature, not the SDK. Register the optional client and callback before
the existing core connection:

```js
import { createWidgetSettingsClient } from './sdk/widget-settings.js';

// `client` and `hostOrigin` come from the app's existing validated setup.
const settings = createWidgetSettingsClient({ client, hostOrigin });
const stopOpening = settings.onOpen(() => {
  showOwnSettingsPanel();
  void settings.get()
    .then(value => fillOwnSettingsForm(value ?? {}))
    .catch(() => showOwnSettingsError('Your settings could not be loaded. Try again.'));
});

await client.connect();

async function saveOwnSettings() {
  try {
    const saved = await settings.save(readOwnSettingsForm());
    fillOwnSettingsForm(saved ?? {});
    closeOwnSettingsPanel();
  } catch {
    showOwnSettingsError('Your settings could not be saved. Try again.');
  }
}

// Add to the app's existing teardown, including Angular ngOnDestroy.
function disposeOwnSettings() {
  stopOpening();
  settings.dispose();
  // The app's existing cleanup still destroys `client` separately.
}
```

Keep the form's Save disabled while it is saving and prevent overlapping saves.
Load before enabling Save so a failed read cannot silently overwrite existing
settings. Preserve the draft after an error; do not automatically retry a save.
Cancel discards edits in the form without sending a save. Ignore late form
updates after the panel/app is disposed. Use ordinary text and form values;
never render stored settings as HTML or include secrets/customer records.

A settings header uses the existing panel and source-verified cog icon:

```html
<section class="rezi-panel" aria-labelledby="widget-settings-heading">
  <header class="rezi-panel__heading">
    <span class="char char-cog heading-icon" aria-hidden="true"></span>
    <h2 class="rezi-panel__title" id="widget-settings-heading">App settings</h2>
  </header>
  <!-- Add only the controls needed for the person's chosen widget feature. -->
</section>
```

The settings facade receives the familiar host open command
`{messageType:'settings'}` through the validated active pairing. The command has
no widget ID or saved data. It is a request to show the panel, not permission to
call arbitrary APIs. `onOpen` also advertises that this app has a settings panel;
do not add an empty panel simply to show a cog.

The preview shows the cog only when a connected dashboard widget registers this
callback. It stays hidden for an unconnected app or a welcome with no settings
feature. The portal's separate **Test settings** panel owns the preview width
and height choices. Short and Medium approximate 200px and 420px; Tall fills the
available vertical preview workspace. The default is one column wide and Tall.
Changing these choices resizes presentation without reopening the app or
resetting its pairing/settings; do not add data requests on resize.

## Temporary preview storage and host support

In the developer website, settings are temporary local preview data for the
**current app pairing**. They can survive an iframe reload while that pairing
remains open. They are not a durable database and do not promise survival after
closing/reloading the developer page, ending/changing the pairing or closing
the browser. Keep demonstrations fictional and show an honest empty state.

The optional facade provides one app-facing get/save interface. Its local host
adapter keeps preview storage separate from real settings. The corresponding
production host adapter has **not been installed or verified in Dezrez yet**.
The existing production settings-open notification alone does not provide this
facade's storage capability. If the host does not support it, explain that the
settings feature is unavailable there; retain the draft and do not bypass the
adapter with tokens, arbitrary requests or an invented widget ID.

This guide and a successful local preview do not establish native integration,
production support, certification, app approval or permission to publish.
