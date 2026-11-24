# Compatibility and release status

Verified package selection: 18 November 2026.

| Component | Exact version |
|---|---|
| Angular framework/compiler | 22.2.6 |
| Angular CLI/build | 22.2.7 |
| TypeScript | 6.0.3 |
| RxJS | 7.8.2 |
| tslib | 2.9.1 |
| Vitest / jsdom | 5.1.0 / 31.0.1 |
| Partner protocol / SDK | dezrez.partner/1 / 0.2.0 (legacy property declarations: 0.1.0) |

Angular's [official compatibility table](https://angular.dev/reference/versions) requires Node `^22.22.3 || ^24.15.0 || ^26.0.0`, TypeScript `>=6.0.0 <6.1.0` and compatible RxJS 6/7 for Angular 22. The exact public registry package engine/peer metadata was also checked. This starter uses Angular's [current standalone testing builder with Vitest](https://angular.dev/guide/testing), not the inherited Jasmine/Protractor/TSLint stack. Angular 22 is actively supported according to the [official release policy](https://angular.dev/reference/releases).

All dependency versions are exact and the version 3 lockfile records public registry URLs and integrity. Ordinary `npm ci` must succeed without private feeds or peer-check bypasses. Package updates require a new compatibility audit, clean install/build/test/package verification and a matching isolated build profile. Do not automatically upgrade the graph to satisfy an assistant suggestion.

## Open gates

- The earlier picomatch tooling advisory [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) was withdrawn on 18 November 2026. The maintainer's [review of the reported issue](https://github.com/micromatch/picomatch/pull/235) explains the trusted-pattern context. A fresh full `npm audit --json`, including development dependencies, completed at 22:36:16 UTC on that date with exit 0 and zero findings at every severity. The dependency lock remains `fb1169a67e220dd410c94a349b25e15682b9c7c147af7421ce256b48bee147d3`. This clears that specific advisory release gate; no dependency upgrade, patch, waiver, audit suppression or force fix was applied. Fixed trusted build configuration/patterns, rejection of submitted globs/plugins/configuration, no per-job install/network and disposable bounded compilation remain independent requirements. A clean audit does not establish freedom from all security risks.
- The maintained starter retains the reviewed Dezrez icon stylesheet/font and readable Exo 2/Poppins fallbacks. Bundle 0.6.0-angular uses the authorised intact hosted kit for Exo Soft/New Rubrik in the child document. Strict preview policy already permits its exact stylesheet/font destinations. Actual loaded faces and visual matching require browser evidence; fallback loading does not establish parity. No Adobe binaries are redistributed.
- The historical buildless static profile does not compile Angular. API certification uses its separate exact locked compiler, fictional API/browser profile and reviewed policy; the submitted app's actual report establishes its result. Local validation alone does not approve a release.
- Local installation/build/unit/package checks and browser/theme evidence are separate. Actual font parity, localhost pairing, live Dezrez authorization and production release require their own verification.

## API certification and isolated Systest release — 0.9.0-angular

This bundle retains the same dependency lock and first welcome while adding
the later API certification guide and complete actual app declarations.
API-only apps need no private-note storage or legacy read/note/save selectors.
The optional source-side `dezrez-certification.json` describes the app's real
visible workflow with fictional API responses. The worker pins its complete
catalog, exact compiler/profile and browser harness; it has no upstream token
or network. Its offline typography is fallback coverage, not loaded-font parity.
An actual certified report, human approval and exact-artifact publication are
separate results. The main Dezrez application is outside this process.
Earlier version sections below describe their historical delivery boundaries.

## Full Systest API — 0.8.0-angular

The independent `dezrez.api/1` extension adds `public/sdk/api.js` and its type
declarations without changing the core SDK0.2.0 wire contract. Use the full
website catalog and data contracts through `references/dezrez-api.md` after the
person chooses a feature. Existing API authorization applies to business reads
and writes; the old three-operation example is compatibility, not a capability
ceiling. The welcome, locked dependencies and first-build checks stay the same.
This does not certify Angular source or deploy a native-host adapter.

The optional later record example implements the documented record-action contract for properties with
optional real marketing roles and minimal people-group context. It retains the
synthetic no-record widget. Source/local checks do not establish connected,
native-host or PM conformance, or arbitrary operations, destinations,
dependencies or deployment targets.

## Record contexts — 0.5.0-angular

SDK0.2.0 adds explicit record-action compatibility and typed context/state
identities, while old SDK0.1.0/property-action declarations stay property-only.
The new mock includes Selling/Letting/Auction and historical roles, people
groups/company/team, and same-property role switching. Groups use supplied
metadata and appState only, with no new child operation or business write.
The note controller preserves drafts on conflicts, offers explicit load retry
and discards stale work on every selected-record/role change.

Canonical SDK/context fixtures and source hashes change the Angular profile
identity. A fresh reviewed worker/profile and independent context calibration
are required; existing frozen evidence is unchanged. This bundle does not
activate, calibrate or certify a worker. Dependencies and their lockfile remain
unchanged.

## App-details release

Skill bundle `0.4.0-angular` adds manifest format 1 and its canonical public
normalizer while keeping wire protocol/SDK `dezrez.partner/1` / `0.1.0` and the
dependency graph unchanged. Both manifests now carry explicitly fictional,
complete declarations. The additional fixed SDK file changes the reviewed source
profile; certification needs a newly bound profile, not reuse of an older profile
digest. No Angular worker activation or certification is claimed by this update.

The full audit's vulnerability summary (18 November 2026, 22:36:16.2300089 UTC,
all installed production and development dependencies, ordinary `npm audit
--json`, exit 0) was:

```json
{"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}
```

## Preview-diagnostics source update

Skill bundle `0.4.1-angular` carries the canonical host-side diagnostics module
required by the local mock host. The source export includes that module and
records its resource hash. It adds redacted host observations without changing
the child protocol, SDK wire version, app operations or dependency lock. Reports
describe observed requests, timing, response sizes and errors; they do not report
real-system token rate limits or remaining allowances. Account-free example
observations remain synthetic, not production cost measurements or authority.

The additional fixed SDK file changes the reviewed source profile. A future
Angular certification must bind a fresh reviewed profile and independent
evidence; existing frozen profiles and results are unchanged. This source update
does not build, activate or certify an Angular worker.

## Optional local HTTPS

Skill bundle `0.4.2-angular` documents the existing Angular CLI HTTPS options
using an external certificate and key. It changes no package, lock, compiler,
build profile or production preview command. Installing a trust tool or changing
computer trust requires the person's permission. This development server is
separate from the strict built preview and does not prove hosted acceptance.


## Synthetic host state adapter

Bundle `0.4.3-angular` updates the copied canonical demo host and its resource
hash. A trusted synthetic host can optionally supply a Map-like `stateStore`;
the default remains the same page-memory store. No child operation, wire protocol,
SDK wire version, dependency or build command changes. This does not grant an app
storage or production authority.

The fixed SDK bytes change the reviewed Angular source/profile identity. Future
Angular certification needs a freshly bound reviewed profile and independent
calibration; old frozen profiles/evidence remain unchanged. This release does
not build, activate or certify an Angular worker. The developer website's saved
copy preview can keep fictional notes across Save/reopen and property changes
within its current page; sign-out or a full developer-page reload clears them.

## Signed-in viewer greeting — 0.7.0-angular

The initial app reads only the signed-in negotiator/me FirstName through the
separate token-free viewer extension1. Create the facade with {client,hostOrigin}
before core connect, request the viewer only after connection and dispose it
before the core client. Manual, hardcoded, URL and ContactName-derived names are
not accepted. Core SDK0.2.0, zero record permissions, dependency locks and the
two-panel welcome remain. This extension needs a supporting trusted host; it
does not establish native-host support, certification or publication eligibility.

## Restored welcome instructions — 0.6.2-angular

The supplied first app keeps two standard panels in every preview location:
the first-name welcome, its starting-app sentence, then What happens next with
the exact three simple numbered instructions in README.md. The code and book
heading icons, body copy and instruction list are deliberately included. No
record, data operation, setting form or business feature is added. The first
smoke check remains this welcome in one current appearance with null context.
SDK0.2.0, the dependency lock and worker profile are unchanged.

## Optional widget-settings source update — 0.6.1-angular

The later 0.6.2 source restores the welcome's body copy and next-step panel.
The source bundle adds an optional `public/sdk/widget-settings.js` facade,
self-contained TypeScript declaration and conditional public guide. The facade
is not imported by core SDK0.2.0 or the default welcome. No dependency, lockfile,
worker input or compiler policy is changed. A later chosen widget can create
the facade before core connection and use its host-paired settings API without
app IDs or environment-specific code. Preview settings are temporary; the
production-host adapter is not installed or verified. This is not connected
widget registration, certification or release evidence.

## Welcome-first source update — 0.6.0-angular

The default entry is now a welcome panel with a first-name greeting and simple
instructions. It has a dashboard-widget draft, no chosen context and empty
permissions. SDK connection is only for host appearance and lifecycle; no broker
operation is sent. `npm run check:welcome` runs only its three focused checks.
The first-build workflow uses that command, build and structural validation;
it does not run the optional record matrix or switch themes.

The preserved record UI, NotesController and tests are separate later learning
material, activated deliberately by `?example=records` or the optional mock.
Its complete record manifest is `public/examples/record-notes.manifest.json`.
The welcome draft does not pass the shared record declaration normalizer and
cannot be represented as certification, registration or publication eligibility.

Source/profile identity changes. No dependency, SDK, compiler, worker profile,
permission policy or locked dependency graph changes. The dependency lock stays
`fb1169a67e220dd410c94a349b25e15682b9c7c147af7421ce256b48bee147d3`.
Future Angular certification still requires an independently reviewed profile;
this export does not activate, calibrate or certify one.
