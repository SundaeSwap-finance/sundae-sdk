[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapInput()

> **getSwapInput**(`inputMetadata`, `output`, `aReserve`, `bReserve`, `totalLp`, `sqrtPriceA`, `sqrtPriceB`, `fee`, `isAInput`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate the minimal input required to receive a given output — the inverse
of [getSwapOutput](getSwapOutput.md). The forward swap is linear-fractional in the
effective input, so it inverts in closed form; a short correction loop
absorbs the fee floor and integer rounding so the result is the exact minimal
input whose forward swap yields at least `output`.

## Parameters

• **inputMetadata**: `IAssetAmountMetadata`

• **output**: `bigint`

• **aReserve**: `bigint`

• **bReserve**: `bigint`

• **totalLp**: `bigint`

• **sqrtPriceA**: [`TSqrtPrice`](../type-aliases/TSqrtPrice.md)

• **sqrtPriceB**: [`TSqrtPrice`](../type-aliases/TSqrtPrice.md)

• **fee**: `TFractionLike`

• **isAInput**: `boolean`

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

## Defined in

[ConcentratedLiquidityPool.ts:168](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConcentratedLiquidityPool.ts#L168)
