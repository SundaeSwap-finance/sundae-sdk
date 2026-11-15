[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TSwapOutcome

> **TSwapOutcome**: `object`

Holds the calculated outcome of a concentrated-liquidity swap. It has the
same shape as `ConstantProductPool.TSwapOutcome`, so the generic
swap-outcome consumers accept it.

## Type declaration

### input

> **input**: `bigint`

### lpFee

> **lpFee**: `AssetAmount`\<`IAssetAmountMetadata`\>

### nextInputReserve

> **nextInputReserve**: `bigint`

### nextOutputReserve

> **nextOutputReserve**: `bigint`

### output

> **output**: `bigint`

### priceImpact

> **priceImpact**: `Fraction`

## Defined in

[ConcentratedLiquidityPool.ts:9](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConcentratedLiquidityPool.ts#L9)
