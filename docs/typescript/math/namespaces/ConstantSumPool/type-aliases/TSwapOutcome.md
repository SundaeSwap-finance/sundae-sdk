[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TSwapOutcome

> **TSwapOutcome**: `object`

Holds the calculated outcome of a constant-sum swap. Mirrors
[ConstantProductPool.TSwapOutcome](../../ConstantProductPool/type-aliases/TSwapOutcome.md) so both can flow through the same
generic swap-outcome consumers.

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

[ConstantSumPool.ts:10](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L10)
