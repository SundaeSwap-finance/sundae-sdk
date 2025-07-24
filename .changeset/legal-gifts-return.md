---
"@sundaeswap/core": patch
---

Temporarily avoids caching reference utxos due to errors in @cardano-sdk/core where using these throws private member access errors.
