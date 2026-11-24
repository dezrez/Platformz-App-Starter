# Optional record example

Use only after the person chooses a record-based app. This is not the first-build workflow. Read the project-root `README.md`, `COMPATIBILITY.md`, `src/app/notes-controller.ts` and `src/app/app.component.html`. Keep this working integration while implementing the person’s idea. Paths and commands are relative to the project root, including when this skill is mirrored into a discovery folder.

Read the project-root `skills/dezrez-angular-app/references/record-contexts.md` before
changing context handling. This starter uses SDK0.2.0 and record-action for a
property with an optional real marketing role, or a people group. Existing
SDK0.1.0/property-action apps remain property-only compatibility.

Check the Node version against `package.json`. Use ordinary `npm ci`, `npm test`, `npm run build` and `npm run validate`; start the strict built preview using `npm start` and retain its process. Use `npm run dev` for rebuilding during edits. Verify the local address responds before handing it back. Set `DEMO_PARENT_ORIGIN` to the exact developer website origin supplied by the person before starting the built preview. Keep the protocol origin exact; localhost and 127.0.0.1 are different origins. The local mock host at `/mock-host.html` uses only fictional properties and page-memory notes.

Use the exact supplied dependency graph. Do not update `package.json`/`package-lock.json`, add packages, use custom builders/plugins or executable configuration, fetch executable scripts remotely, or run force/legacy-peer-deps. A new dependency requires a reviewed build profile. The isolated Angular build profile is a separate certification capability; current static-source certification does not establish Angular support.

This optional compatibility note example uses `public/sdk/client.js` and its
versioned contract. Connect with the pairing-supplied `hostOrigin`; preserve
exact parent window/origin/session checks. Dezrez credentials stay in the host.
These three helpers are not the limit of the full API: read the project-root
`references/dezrez-api.md` for requested business reads and writes through
`public/sdk/api.js`. The example uses:

| Operation | Input | Result |
|---|---|---|
| `property.read` | `{ propertyId: context.id }`, only for a property context | Selected property, including nullable price/bedrooms |
| `appState.get` | `{}` | `{ note, version }` for the selected record/marketing role |
| `appState.set` | `{ note, version }` | Saved note and incremented version |

The host owns context, effective permission, persistence and budgets. A manifest grants no authority. Do not replace host state with local storage or call arbitrary Dezrez/provider endpoints. Keep notes at most 500 characters. Preserve the draft on a version conflict, block overlapping writes and never retry a write automatically. Keep pause/visibility/close gating, abortable reads, context generations and stale-reply rejection. Destroy the SDK client and listeners on teardown. Handle host theme, context, enabled, action and closed events. Explain throttling, expiry, denied access, missing data and cancellation without leaking raw internal errors.

For a group, show only supplied name/groupType and use app-owned state; never
call property.read or put the group ID into propertyId. The website derives the
signed-in agency automatically. Keep separate state for each selected record
and marketing role, including multiple roles of one property. A context event
always invalidates old drafts, requests and host actions, even when property ID
is unchanged. If note loading fails, offer Try loading note again and disable
Save until its version is known; a conflict retains the draft until that
explicit reload. A successful property read cannot hide a failed note load.

No record selected means a synthetic dashboard widget: explicit `surface:'dashboard-widget'`, true `context:null`, empty permissions, no record API calls and no host dialog/footer. Preserve the null-state view and clear drafts/version on context loss. Never invent a record or agency ID. Changing surface recreates the host/session. The synthetic widget does not enable production widgets or establish native conformance.

For optional dialog actions, preserve `client.setActionState({enabled})` readiness updates and the host-provided `actionId` on Save. Complete only that action with `client.completeAction(actionId,{success:true})` after the save succeeds, or `success:false` after an error so the dialog stays open. Do not claim success before the operation finishes, replay IDs, invent close messages or change Cancel visibility from app code. The SDK negotiates `capabilities.dialogActions`; unsupported hosts return `false` and retain ordinary read/save behavior. Manifest dialog labels are plain text of at most 30 characters; `actionText:null` means no host primary button.

Retain the Light, Dark and High Contrast semantic tokens and global component rules. Do not add component styles or inline styles that the strict preview policy blocks. High Contrast grows text and controls by 1.2. Fields use the final orange focus boundary. Every standard heading has a source-verified decorative Dezrez `char-*` icon beside its real text. Keep the reviewed local icon CSS/font and fontSource hosted. Follow the project-root references/rezi-styling.md for actual Exo Soft/New Rubrik loading through the intact authorised kit; never repackage Adobe binaries. The child obeys its host-owned theme and must not persist a localhost choice over it. Keep `current` distinct from modern IDs; the documented standalone Light fallback must not rewrite it.

Keep `manifest.json` and `public/manifest.json` synchronized. Preserve `data-partner-read`, `data-partner-note`, `data-partner-save`, `data-partner-status` and `data-partner-context` on real visible controls, or update the manifest selectors. These help a genuine external harness exercise the app; they are not evidence that checks passed.

Verify property-only, Selling/Letting/Auction and history, group/company/team and
no-context widget; success, slow/cancel, throttled, expired, denied and missing
outcomes; context and same-property role swaps during work; pause/resume; host
Save; note-load retry; close and repeated mount; long/missing values;
500-character notes and conflict preservation. Check themes, keyboard focus,
narrow layouts, High Contrast and reduced motion in the actual browser using
the environment’s permitted browser tool. Unit tests do not prove visual parity.

Use the developer website's optional Activity view and redacted download to investigate repeated reads, overlapping work, request counts, timings and actual errors. These observations describe preview traffic only; do not report token rate limits or remaining request allowances. A cached result is not proof of a retry, a repeated request is not proof of polling, and unobserved retries stay unknown. Keep note text, credentials and record payloads out of diagnostics.

Give a beginner the verified local address and one next action: paste it into **Open my app for testing** in the developer website. Explain unsupported capabilities plainly. `npm run package` packages existing built bytes only; local checks, a mock host or a ZIP do not approve certification, deploy a release or authorize real writes.

If asked for skill discovery, copy this canonical folder into this project’s `.agents/skills/dezrez-angular-app` for Codex or `.claude/skills/dezrez-angular-app` for Claude Code. Update both from the canonical folder; do not modify global assistant settings.

## Maintain the app details

Read [the app-details contract](app-details.md). Preserve the explicit
`manifestVersion:1` declaration sections and validate them with the supplied
shared normalizer. Keep `example:true` for the complete fictional demonstration;
never invent real organisation, support or usage values. Unknown required values
are a visibly incomplete draft and cannot be privately submitted. If the owner
explicitly approves fictional partner details for an internal demo, keep them
and `example:true`; do not ask for real contacts again or change the marker to
pass a check. A Dezrez reviewer must separately acknowledge those details for
the exact internal pilot release. Ask for missing workload assumptions
separately; measured workflow and capacity evidence are still required for
publication. Legacy and incomplete details cannot be published. Usage counts are
totals across the whole
population and horizon, never per-instance rates or trusted calibration.
Declarations cannot increase access, storage, request budgets or concurrency.

## If the browser needs a secure local address

Keep the usual setup first. If your browser needs an HTTPS address, give your AI
the message in [the optional secure local setup](local-https.md).
It explains the change before asking to install anything or change computer trust.
Keep certificate keys outside your project and source submission.


The bundled canonical synthetic host accepts an optional trusted Map-like state
adapter without changing any child operation. Preserve these reviewed SDK bytes.
A developer website may keep temporary fictional notes for one checked app build
across preview reopen/property changes; this is not connected app-owned storage.
