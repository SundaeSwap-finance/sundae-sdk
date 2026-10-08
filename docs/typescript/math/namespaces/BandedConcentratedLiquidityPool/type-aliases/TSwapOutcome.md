[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TSwapOutcome

> **TSwapOutcome**: `object`

Holds the calculated outcome of a concentrated-liquidity swap. Mirrors
[ConstantProductPool.TSwapOutcome](../../ConstantProductPool/type-aliases/TSwapOutcome.md) so it flows through the same generic
swap-outcome consumers.

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

[ConcentratedLiquidityPool.ts:11](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConcentratedLiquidityPool.ts#L11)
