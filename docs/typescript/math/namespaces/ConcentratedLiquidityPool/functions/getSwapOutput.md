[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapOutput()

> **getSwapOutput**(`inputMetadata`, `input`, `aReserve`, `bReserve`, `totalLp`, `sqrtPriceA`, `sqrtPriceB`, `fee`, `isAInput`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate the swap outcome for a concentrated-liquidity pool.

## Parameters

• **inputMetadata**: `IAssetAmountMetadata`

Metadata for the supplied (input) asset — used for the fee AssetAmount.

• **input**: `bigint`

The pre-fee amount of the input asset being swapped.

• **aReserve**: `bigint`

The pool's raw reserve of asset A.

• **bReserve**: `bigint`

The pool's raw reserve of asset B.

• **totalLp**: `bigint`

The pool's total LP supply (the virtual liquidity `L`).

• **sqrtPriceA**: [`TSqrtPrice`](../type-aliases/TSqrtPrice.md)

The lower sqrt-price bound `[num, den]` from the CL config.

• **sqrtPriceB**: [`TSqrtPrice`](../type-aliases/TSqrtPrice.md)

The upper sqrt-price bound `[num, den]` from the CL config.

• **fee**: `TFractionLike`

The liquidity-provider fee (plus protocol fee) as a fraction.

• **isAInput**: `boolean`

True when asset A is the supplied asset (A→B swap).

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details in the shared [TSwapOutcome](../type-aliases/TSwapOutcome.md) shape.

## Defined in

[ConcentratedLiquidityPool.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConcentratedLiquidityPool.ts#L94)
