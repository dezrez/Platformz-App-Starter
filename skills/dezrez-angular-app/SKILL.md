---
name: dezrez-angular-app
description: Adapt, run and test the Dezrez Angular Basic starter through its canonical partner SDK and developer website, retaining the locked build profile and Dezrez themes.
metadata:
  version: 0.4.1-angular
---

# Dezrez Angular app

Read the project-root `README.md`, `COMPATIBILITY.md`, `src/app/notes-controller.ts` and `src/app/app.component.html`. Keep this working integration while implementing the person’s idea. Paths and commands are relative to the project root, including when this skill is mirrored into a discovery folder.

Check the Node version against `package.json`. Use ordinary `npm ci`, `npm test`, `npm run build` and `npm run validate`; start the strict built preview using `npm start` and retain its process. Use `npm run dev` for rebuilding during edits. Verify the local address responds before handing it back. Set `DEMO_PARENT_ORIGIN` to the exact developer website origin supplied by the person before starting the built preview. Keep the protocol origin exact; localhost and 127.0.0.1 are different origins. The local mock host at `/mock-host.html` uses only fictional properties and page-memory notes.

Use the exact supplied dependency graph. Do not update `package.json`/`package-lock.json`, add packages, use custom builders/plugins or executable configuration, fetch executable scripts remotely, or run force/legacy-peer-deps. A new dependency requires a reviewed build profile. The isolated Angular build profile is a separate certification capability; current static-source certification does not establish Angular support.

Use `public/sdk/client.js` and its versioned contract. Connect with the pairing-supplied `hostOrigin`; preserve exact parent window/origin/session checks. Dezrez credentials stay in the host. The only operations are:

| Operation | Input | Result |
|---|---|---|
| `property.read` | `{ propertyId: context.id }` | Selected property, including nullable price/bedrooms |
| `appState.get` | `{ propertyId: context.id }` | `{ note, version }` |
| `appState.set` | `{ propertyId: context.id, note, version }` | Saved note and incremented version |

The host owns context, effective permission, persistence and budgets. A manifest grants no authority. Do not replace host state with local storage or call arbitrary Dezrez/provider endpoints. Keep notes at most 500 characters. Preserve the draft on a version conflict, block overlapping writes and never retry a write automatically. Keep pause/visibility/close gating, abortable reads, context generations and stale-reply rejection. Destroy the SDK client and listeners on teardown. Handle host theme, context, enabled, action and closed events. Explain throttling, expiry, denied access, missing data and cancellation without leaking raw internal errors.

No record selected means a synthetic dashboard widget: explicit `surface:'dashboard-widget'`, true `context:null`, empty permissions, no record API calls and no host dialog/footer. Preserve the null-state view and clear property drafts/version on context loss. Never invent a property or agency ID. A record dialog requires selected context; changing surface recreates the host/session. The production pilot remains property-action only.

For optional dialog actions, preserve `client.setActionState({enabled})` readiness updates and the host-provided `actionId` on Save. Complete only that action with `client.completeAction(actionId,{success:true})` after the save succeeds, or `success:false` after an error so the dialog stays open. Do not claim success before the operation finishes, replay IDs, invent close messages or change Cancel visibility from app code. The SDK negotiates `capabilities.dialogActions`; unsupported hosts return `false` and retain ordinary read/save behavior. Manifest dialog labels are plain text of at most 30 characters; `actionText:null` means no host primary button.

Retain the Light, Dark and High Contrast semantic tokens and global component rules. Do not add component styles or inline styles that the strict preview policy blocks. High Contrast grows text and controls by 1.2. Fields use the final orange focus boundary. Every standard heading has a source-verified decorative Dezrez `char-*` icon beside its real text. Keep the reviewed local icon CSS/font and the explicit `fontSource:'bundled'` theme option. Angular bundles these public icon resources and the licensed Exo 2/Poppins fallback faces into local output; no hosted type-kit or icon requests are needed. Keep font notices. Check actual loading and report `bundled`/fallback honestly; these faces do not establish Exo Soft/New Rubrik parity, and Adobe binaries must not be copied. The child obeys its host-owned theme and must not persist a localhost choice over it. Keep `current` distinct from modern IDs; the documented standalone Light fallback must not rewrite it.

Keep `manifest.json` and `public/manifest.json` synchronized. Preserve `data-partner-read`, `data-partner-note`, `data-partner-save`, `data-partner-status` and `data-partner-context` on real visible controls, or update the manifest selectors. These help a genuine external harness exercise the app; they are not evidence that checks passed.

Verify success, slow/cancel, throttled, expired, denied and missing outcomes; context swaps during work; pause/resume; host Save; close and repeated mount; long/missing values; 500-character notes and conflict preservation. Check themes, keyboard focus, narrow layouts, High Contrast and reduced motion in the actual browser using the environment’s permitted browser tool. Unit tests do not prove visual parity.

Use the developer website's optional Activity view and redacted download to investigate repeated reads, overlapping work, request counts, timings and actual errors. These observations describe preview traffic only; do not report token rate limits or remaining request allowances. A cached result is not proof of a retry, a repeated request is not proof of polling, and unobserved retries stay unknown. Keep note text, credentials and record payloads out of diagnostics.

Give a beginner the verified local address and one next action: paste it into **Open my app for testing** in the developer website. Explain unsupported capabilities plainly. `npm run package` packages existing built bytes only; local checks, a mock host or a ZIP do not approve certification, deploy a release or authorize real writes.

If asked for skill discovery, copy this canonical folder into this project’s `.agents/skills/dezrez-angular-app` for Codex or `.claude/skills/dezrez-angular-app` for Claude Code. Update both from the canonical folder; do not modify global assistant settings.

## Maintain the app details

Read [the app-details contract](references/app-details.md). Preserve the explicit
`manifestVersion:1` declaration sections and validate them with the supplied
shared normalizer. Keep `example:true` for the complete fictional demonstration;
never invent real organisation, support or usage values. Unknown required values
are a visibly incomplete draft and cannot be privately submitted. Ask the owner
for real values before preparing publication; update the declarations and set
`example:false` only when supplied. Publication separately rejects legacy,
incomplete and example details. Usage counts are totals across the whole
population and horizon, never per-instance rates or trusted calibration.
Declarations cannot increase access, storage, request budgets or concurrency.
