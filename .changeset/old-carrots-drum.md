---
"@sundaeswap/yield-farming": patch
"@sundaeswap/taste-test": patch
"@sundaeswap/gummiworm": patch
"@sundaeswap/core": patch
"@sundaeswap/math": patch
"@sundaeswap/cli": patch
---

Update import/export patterns to reduce circular dependencies. Also moves peer dependencies to pinned versions, choosing to allow consuming clients to resolve their versionings with "overrides".
