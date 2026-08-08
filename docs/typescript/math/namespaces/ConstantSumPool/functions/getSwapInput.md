[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapInput()

> **getSwapInput**(`inputMetadata`, `output`, `inputReserve`, `outputReserve`, `priceIn`, `priceOut`, `fee`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate the minimal input required to receive a given output from a
constant-sum pool — the exact inverse of [getSwapOutput](getSwapOutput.md).

The forward math floors the fee off the input value, which makes the
post-fee value `ceil(input·priceIn·(1−fee))`; inverting that ceiling gives
the smallest input whose forward swap yields at least `output`.

Unlike constant product there is no asymptote, so an output equal to the
full output reserve is attainable (the pool can be drained at par).

## Parameters

• **inputMetadata**: `IAssetAmountMetadata`

Metadata for the supplied (input) asset — used for the fee AssetAmount.

• **output**: `bigint`

The desired amount of the output asset.

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

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details in the shared [TSwapOutcome](../type-aliases/TSwapOutcome.md) shape.

## Defined in

[ConstantSumPool.ts:125](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L125)
