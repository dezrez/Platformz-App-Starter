---
name: dezrez-angular-app
description: Start a small Dezrez welcome app, then help the person choose and build their own idea with the locked Angular starter and supplied Dezrez styling.
metadata:
  version: 0.6.1-angular
---

# Dezrez Angular app

Read `DEZREZ-START-HERE.md`, `README.md`, `AGENTS.md` and the project-root
`references/rezi-styling.md`. Paths here are relative to the project root even
when this skill is copied into an assistant's discovery folder.

## First: a welcome, with no app idea chosen

The first build is only a single supplied Dezrez panel saying
"{first name} welcome to Dezrez vibe coding". Display no other app copy,
instruction list or next-steps panel. Give instructions in the wizard, guides
or AI chat. Changing preview location must not choose a prebuilt feature.
Ask for the first name if it was not supplied; put it in `configuredFirstName`
in `src/app/app.component.ts`. Without a name, keep the friendly unnamed welcome.
The optional `firstName` URL value is bounded display text, never record context.
Do not add notes, reminders, property fields, example customer data, selectors,
dialog actions or another feature before the person chooses their idea.

Keep `manifest.json` and `public/manifest.json` as the welcome draft:
`surface:'dashboard-widget'`, `permissions:[]` and
`starter:{phase:'welcome',context:'not-chosen'}`. The preview supplies a true null
context. The welcome entry connects only for validated host appearance/lifecycle;
it makes no broker requests, direct API calls or storage reads/writes.
`npm run validate` checks this draft's structure; it is not a record certification
profile, app registration, release approval or permission to publish.

Check Node against `package.json`, then use ordinary `npm ci`,
`npm run check:welcome`, `npm run build`, `npm run validate` and `npm start`.
Use `npm run dev` for rebuilding while editing. Retain the running app process.
Set `DEMO_PARENT_ORIGIN` to the exact developer website origin before the built
preview starts. Verify the local address responds, then give the person that
address and one next action in plain language.

The first visible check is just the welcome panel, correct loaded fonts and the
one current appearance: Light when opened locally on its own, or the host's
effective appearance when embedded. Keep all supplied theme support, but do not
switch themes, run a record/context test matrix, open the optional mock host,
or require certification before the person has chosen their app.

Never open the developer website inside an AI's internal browser. The person
uses their normal Chrome or Edge window. Keep the internal browser for the
local app only when an inspection is actually needed; do not use a local
stand-in host as evidence of a successful developer-website test.

## Then: help the person choose their own app

Ask what they want the app to do and where it should appear before changing
context or permissions. Property Hubs use property choices and their actual
marketing roles, Groups use group choices, and Dashboard has no selected record.
The signed-in agency is supplied by the website; never ask them to choose one.
Do not treat the optional record-notes example as a requirement for their app.

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

For a record app, replace both draft manifests with complete accurate
declarations for the chosen behavior and remove the welcome marker. The
supplied normalizer and record checks then apply. Add focused tests appropriate
to the chosen surface and operations. `npm test` is the optional full developer
suite, including the preserved record example; it is not the first welcome step.
The current buildless certification pilot does not certify Angular source.

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
