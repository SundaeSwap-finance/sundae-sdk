[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TSwapOutcome

> **TSwapOutcome**: `object`

Holds the calculated outcome of a v4 stableswap swap. Mirrors
[ConstantProductPool.TSwapOutcome](../../ConstantProductPool/type-aliases/TSwapOutcome.md) so it flows through the same generic
swap-outcome consumers.

`lpFee` is denominated in the **output** asset, not the input asset. The
stableswap fee is taken off the gross output (`fee = ceil(gross · feeRate)`),
unlike constant product and constant sum which take the fee off the input.
The v3 `StableSwapsPool` does the same.

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

[V4StableswapPool.ts:58](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L58)
