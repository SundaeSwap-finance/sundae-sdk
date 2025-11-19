[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TSwapOutcome

> **TSwapOutcome**: `object`

Represents the complete outcome of a swap operation in a Stableswaps pool.
Contains all relevant information about the swap including amounts, fees, updated reserves,
and price impact.

## Type declaration

### input

> **input**: `bigint`

The amount of input tokens being swapped

### lpFee

> **lpFee**: `AssetAmount`\<`IAssetAmountMetadata`\>

The portion of fees that goes to liquidity providers

### nextInputReserve

> **nextInputReserve**: `bigint`

The input asset reserve amount after the swap

### nextOutputReserve

> **nextOutputReserve**: `bigint`

The output asset reserve amount after the swap (excluding protocol fees)

### nextSumInvariant

> **nextSumInvariant**: `bigint`

The pool's sum invariant (D) after the swap

### output

> **output**: `bigint`

The amount of output tokens received (after all fees)

### priceImpact

> **priceImpact**: `Fraction`

The price impact of the swap as a fraction (difference between ideal and actual price)

### protocolFee

> **protocolFee**: `AssetAmount`\<`IAssetAmountMetadata`\>

The portion of fees that goes to the protocol

## Defined in

[StableSwapsPool.ts:288](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L288)
