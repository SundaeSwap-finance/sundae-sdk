[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapInput()

> **getSwapInput**(`outputMetadata`, `output`, `inputReserve`, `outputReserve`, `rateIn`, `rateOut`, `amp`, `fee`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate the minimal input that buys a given output — the inverse of
[getSwapOutput](getSwapOutput.md).

The steps:

1. Invert the fee: the smallest gross output that nets `output` after
   `ceil(gross · feeRate)` is `ceil(output · feeDen / (feeDen − feeNum))`.
2. Turn that gross into the scaled reserve the pool may keep of the taken
   asset.
3. Solve the exchange invariant in the other direction for the given
   reserve that supports it. `g` is symmetric, so this is the same solver.
4. Convert to token units and walk down to the minimum, which absorbs the
   integer rounding of step 3.

## Parameters

• **outputMetadata**: `IAssetAmountMetadata`

Metadata for the **taken** asset. The fee is denominated in it.

• **output**: `bigint`

The wanted amount of the taken asset.

• **inputReserve**: `bigint`

The pool's reserve of the given asset.

• **outputReserve**: `bigint`

The pool's reserve of the taken asset.

• **rateIn**: `bigint`

The pool's rate for the given asset (from the stableswap config).

• **rateOut**: `bigint`

The pool's rate for the taken asset.

• **amp**: `bigint`

The pool's `linear_amplification` (`A`).

• **fee**: `TFractionLike`

The swap fee rate, applied to the gross output.

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details in the shared [TSwapOutcome](../type-aliases/TSwapOutcome.md) shape.

## Defined in

[V4StableswapPool.ts:394](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L394)
