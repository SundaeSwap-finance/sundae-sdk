---
"@sundaeswap/core": minor
"@sundaeswap/math": minor
"@sundaeswap/cli": minor
---

A zap quote for v4 constant-sum pools.

`ConstantSumPool.calculateZap` finds the swap that leaves a non-proportional
two-asset basket proportional to the post-swap reserves — a closed form, since
the dx² terms cancel — and runs the target-pinned deposit on what is left.
`SundaeUtils.getZapQuote` wraps it for an `IPoolData`: expected LP, a
slippage-derived `minLp` for the order's `minReceived`, the swap leg, and
the change. The order itself is a plain `TxBuilderV4.deposit`.

`QueryProviderSundaeSwap` now maps a v4 pool's `curve`, constant-sum
`prices` and datum `totalLp` onto `IPoolData`, so the constant-sum
branches of `getSwapOutput`, `getSwapInput` and `calculateLiquidity` work
on pools fetched from the API instead of throwing on the missing prices.

The CLI gains a `Zap (v4)` menu.
