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

Angular’s [official compatibility table](https://angular.dev/reference/versions) requires Node `^22.22.3 || ^24.15.0 || ^26.0.0`, TypeScript `>=6.0.0 <6.1.0` and compatible RxJS 6/7 for Angular 22. The exact public registry package engine/peer metadata was also checked. This starter uses Angular’s [current standalone testing builder with Vitest](https://angular.dev/guide/testing), not the inherited Jasmine/Protractor/TSLint stack. Angular 22 is actively supported according to the [official release policy](https://angular.dev/reference/releases).

All dependency versions are exact and the version 3 lockfile records public registry URLs and integrity. Ordinary `npm ci` must succeed without private feeds or peer-check bypasses. Package updates require a new compatibility audit, clean install/build/test/package verification and a matching isolated build profile. Do not automatically upgrade the graph to satisfy an assistant suggestion.

## Open gates

- The tooling dependency graph currently inherits the high-severity **picomatch ReDoS advisory GHSA-fc5q-39xc-vjpf / CVE-2026-112366**, reported through 12 packages by npm audit. The affected paths are Angular build → watcher/glob/Vite → picomatch, Angular CLI → devkit/core → picomatch, and Vitest → glob/Vite/picomatch. The production-only dependency audit reports zero advisories; that does not clear the build toolchain. The [reviewed advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) lists no patched version as of this audit. It is not hidden or marked fixed. Fixed trusted build configuration and patterns, rejection of submitted globs/plugins/configuration, no per-job dependency install or network, and bounded CPU/memory/time in a disposable compiler stage reduce exposure but do not remove the advisory. Dependency release review must explicitly resolve this gate.
- The maintained starter bundles the reviewed public Rezi icon stylesheet/font and explicitly uses local Exo 2/Poppins fallback fonts. It needs no cross-origin font resource under the app policy. Actual local loading and theme/browser checks remain separate evidence; bundled fallback faces do not establish Exo Soft/New Rubrik parity. No Adobe binaries are redistributed.
- This Angular source cannot be certified by the current buildless static pilot. A separate locked offline Angular compiler stage, followed by an independent disposable conformance stage and reviewed policy, is required. No Angular certification or production deployment is claimed here.
- Local installation/build/unit/package checks and browser/theme evidence are separate. Actual font parity, localhost pairing, live Rezi authorization and production release require their own verification.

This app supports the documented Rezi property-action partner surface. It does not establish PM context/lifecycle support or arbitrary operations, destinations, dependencies or deployment targets.
