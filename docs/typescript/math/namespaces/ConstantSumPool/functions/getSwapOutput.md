[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapOutput()

> **getSwapOutput**(`inputMetadata`, `input`, `inputReserve`, `outputReserve`, `priceIn`, `priceOut`, `fee`, `roundOutputUp`?): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate the swap outcome for a constant-sum (fixed-price) pool — the
invariant used by Sundae v4 stable/pegged pools. Unlike constant product,
the exchange rate is fixed by the pool's per-asset `prices`: the input is
converted to "value" at `priceIn`, the fee is taken off that value, and the
remainder is converted to the output asset at `priceOut`. The result is
capped at the output reserve (you can't take more than the pool holds).

Matches the scooper's `cs_swap_result`:
  output = floor((input·priceIn − floor(input·priceIn·fee)) / priceOut)

## Parameters

• **inputMetadata**: `IAssetAmountMetadata`

Metadata for the supplied (input) asset — used for the fee AssetAmount.

• **input**: `bigint`

The amount of the input asset being swapped.

• **inputReserve**: `bigint`

The pool's reserve of the input asset.

• **outputReserve**: `bigint`

The pool's reserve of the output asset.

• **priceIn**: `bigint`

The pool's price for the input asset (from the constant-sum config).

• **priceOut**: `bigint`

The pool's price for the output asset.

• **fee**: `TFractionLike`

The liquidity-provider fee (plus protocol fee) as a fraction.

• **roundOutputUp?**: `boolean`

When true, round the output up instead of flooring.

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details in the shared [TSwapOutcome](../type-aliases/TSwapOutcome.md) shape.

## Defined in

[ConstantSumPool.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L40)
