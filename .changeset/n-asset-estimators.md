---
"@sundaeswap/core": minor
---

Pool data now describes every asset a v4 pool holds, and swaps between any two
of them can be estimated.

`IPoolData` gains optional `assets`: every asset the pool holds with its
`quantity`, in pool order, the element shape `IPoolV4.assets` already reads
from the datum, plus decimals. `prices` may hold one entry per asset rather
than exactly two. `assetA`, `assetB`, `liquidity` and the existing estimators are unchanged
and keep describing the pool's first two assets, so nothing that works today
changes.

`QueryProviderSundaeSwap` selects `assets` and `quantities` and keeps the whole
price vector; it used to keep the first two prices only, which mispriced any
trade touching a third asset.

`SundaeUtils.getNSwapOutput(pool, supplied, takenAssetId)` and
`SundaeUtils.getNSwapInput(pool, output, givenAssetId)` estimate a swap between
two named assets of the pool. On a pair they defer to `getSwapOutput` and
`getSwapInput`; on a constant-sum pool of more than two assets they price each
leg by its own entry.
