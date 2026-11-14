---
"@sundaeswap/math": patch
"@sundaeswap/core": patch
---

Banded concentrated liquidity follows the sundae-v4 SV4 audit fixes.

- The band fee rounds up, as `cl_check.band_fee` does (`bandFee`). A banded
  quote can pay one unit less than before.
- `TxBuilderV4.mintPool` creates a banded pool at a counter (`total_lp`) of
  at least `1000 × weightTotal` (`MIN_COUNTER_PER_WEIGHT`,
  `minCreateCounter`). A smaller explicit `counter` throws. The default
  counter is the larger of 1e9 and the minimum.
