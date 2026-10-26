---
"@sundaeswap/core": patch
---

`SundaeUtils.getSwapOutput` now compares asset ids alias-aware, as
`getSwapInput` already did. It matched the supplied asset against the pool's
`assetA` with a raw `===`, so ADA written as `""` or `"."` against a pool whose
`assetA` is `"ada.lovelace"` was priced against the other side of the pool. A
MARKET swap's minimum received, which comes from this quote, was then wrong. In
a chained swap that could leave an order unable to fill. On a v4 pool the
alias was refused outright as an asset the pool does not hold.
