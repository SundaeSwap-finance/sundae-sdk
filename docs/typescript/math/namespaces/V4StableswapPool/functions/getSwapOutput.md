[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapOutput()

> **getSwapOutput**(`outputMetadata`, `input`, `inputReserve`, `outputReserve`, `rateIn`, `rateOut`, `amp`, `fee`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate the swap outcome for a v4 stableswap pool.

The sequence the chain enforces (`ss_check.ak`, tag 3):

1. `D` is derived from the pre-swap reserves at the pool's rates.
2. `raw` is the smallest scaled output that solves the exchange invariant at
   that `D`, with the input already added to the given reserve.
3. `gross = floor(raw / (rateOut · CALC_PRECISION))` is the output in token units.
4. `fee = ceil(gross · feeRate)` stays in the pool.
5. The trader receives `gross − fee`.

## Parameters

• **outputMetadata**: `IAssetAmountMetadata`

Metadata for the **taken** asset. The fee is denominated in it.

• **input**: `bigint`

The amount of the given asset being swapped.

• **inputReserve**: `bigint`

The pool's reserve of the given asset.

• **outputReserve**: `bigint`

The pool's reserve of the taken asset.

• **rateIn**: `bigint`

The pool's rate for the given asset (from the stableswap config).

• **rateOut**: `bigint`

The pool's rate for the taken asset.

• **amp**: `bigint`

The pool's `linear_amplification` (`A`), the raw stored integer.

• **fee**: `TFractionLike`

The swap fee rate, applied to the gross output.

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details in the shared [TSwapOutcome](../type-aliases/TSwapOutcome.md) shape.

## Defined in

[V4StableswapPool.ts:312](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L312)
