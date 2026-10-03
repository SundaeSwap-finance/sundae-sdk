---
"@sundaeswap/core": minor
"@sundaeswap/cli": minor
"@sundaeswap/taste-test": minor
"@sundaeswap/yield-farming": minor
---

Upgrade to the latest `@blaze-cardano` packages: `sdk@^0.3.1`,
`data@^0.6.9`, `core@^0.9.1`, `emulator@^0.5.2`.

`@blaze-cardano/data@0.6.9` requires `@blaze-cardano/core@^0.9.1`, so every
blaze package moves together to keep a single copy of `core` in the tree.
Consumers passing their own `Blaze` instance should upgrade to
`@blaze-cardano/sdk@^0.3` to avoid type mismatches.
