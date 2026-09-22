---
"@sundaeswap/core": minor
"@sundaeswap/math": minor
---

v4 stableswap pool math.

`EPoolCurve.V4Stableswap` is the v4 stableswap invariant module: a Curve-style
two-asset curve for pegged pairs. It is NOT `EContractVersion.Stableswaps`,
which is the v3 stableswap contract. The two share a curve shape and nothing
else, so the estimator is a separate module, `V4StableswapPool`, and the pool
data fields are separate too.

`V4StableswapPool` covers the sum invariant `D`, swap output, reverse swap
(input for a wanted output), the curve's marginal price, and target-pinned
deposits. `D` and the swap output both need Newton's method, so the module
reproduces the scooper's solvers and their integer rounding rather than
approximating them. The fee comes off the gross output, not the input, so
`lpFee` is denominated in the output asset.

`IPoolData` gains `rates`, the per-asset integer rates aligned to
`[assetA, assetB]`. The amplification the curve also needs is the existing
`linearAmplificationFactor`: one parameter, one field, both versions, on one
scale. Each implementation applies its own internal scaling.

`SundaeUtils.getSwapOutput`, `getSwapInput`, `calculateLiquidity` and `getPrice`
all dispatch the new curve. `getPrice` takes the curve's marginal price at the
current reserves, because a stableswap pool's price moves with its reserves —
unlike constant sum, whose price is fixed.
