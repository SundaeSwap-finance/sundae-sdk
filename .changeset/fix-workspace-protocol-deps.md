---
"@sundaeswap/core": patch
"@sundaeswap/taste-test": patch
"@sundaeswap/yield-farming": patch
---

Republish with real dependency ranges. The 2026-09-09 releases (core 2.14.0,
taste-test 3.0.19, yield-farming 3.1.18) shipped literal `workspace:*`
dependency specs: the previous `bun publish` pipeline rewrote the workspace
protocol at pack time, and the npm-based trusted-publishing pipeline does
not. Those versions cannot be installed by any consumer. Internal
dependencies are now declared as real semver ranges in the manifests, which
`npm publish` ships verbatim and changesets keeps current on each release.
