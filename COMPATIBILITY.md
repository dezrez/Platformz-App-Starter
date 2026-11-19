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
| Partner protocol / SDK | dezrez.partner/1 / 0.1.0 |

Angular's [official compatibility table](https://angular.dev/reference/versions) requires Node `^22.22.3 || ^24.15.0 || ^26.0.0`, TypeScript `>=6.0.0 <6.1.0` and compatible RxJS 6/7 for Angular 22. The exact public registry package engine/peer metadata was also checked. This starter uses Angular's [current standalone testing builder with Vitest](https://angular.dev/guide/testing), not the inherited Jasmine/Protractor/TSLint stack. Angular 22 is actively supported according to the [official release policy](https://angular.dev/reference/releases).

All dependency versions are exact and the version 3 lockfile records public registry URLs and integrity. Ordinary `npm ci` must succeed without private feeds or peer-check bypasses. Package updates require a new compatibility audit, clean install/build/test/package verification and a matching isolated build profile. Do not automatically upgrade the graph to satisfy an assistant suggestion.

## Open gates

- The earlier picomatch tooling advisory [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) was withdrawn on 18 November 2026. The maintainer's [review of the reported issue](https://github.com/micromatch/picomatch/pull/235) explains the trusted-pattern context. A fresh full `npm audit --json`, including development dependencies, completed at 22:36:16 UTC on that date with exit 0 and zero findings at every severity. The dependency lock remains `fb1169a67e220dd410c94a349b25e15682b9c7c147af7421ce256b48bee147d3`. This clears that specific advisory release gate; no dependency upgrade, patch, waiver, audit suppression or force fix was applied. Fixed trusted build configuration/patterns, rejection of submitted globs/plugins/configuration, no per-job install/network and disposable bounded compilation remain independent requirements. A clean audit does not establish freedom from all security risks.
- The maintained starter bundles the reviewed public Dezrez icon stylesheet/font and explicitly uses local Exo 2/Poppins fallback fonts. It needs no cross-origin font resource under the app policy. Actual local loading and theme/browser checks remain separate evidence; bundled fallback faces do not establish Exo Soft/New Rubrik parity. No Adobe binaries are redistributed.
- This Angular source cannot be certified by the current buildless static pilot. A separate locked offline Angular compiler stage, followed by an independent disposable conformance stage and reviewed policy, is required. No Angular certification or production deployment is claimed here.
- Local installation/build/unit/package checks and browser/theme evidence are separate. Actual font parity, localhost pairing, live Dezrez authorization and production release require their own verification.

This app supports the documented Dezrez property-action partner surface. It does not establish PM context/lifecycle support or arbitrary operations, destinations, dependencies or deployment targets.

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
