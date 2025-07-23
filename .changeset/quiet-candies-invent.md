---
"@sundaeswap/cli": patch
"@sundaeswap/core": patch
"@sundaeswap/taste-test": patch
"@sundaeswap/yield-farming": patch
---

Updates class references when adding referenceInputs to Blaze's transaction builder. This is an attempt to avoid private class member access somewhere in the tree.
