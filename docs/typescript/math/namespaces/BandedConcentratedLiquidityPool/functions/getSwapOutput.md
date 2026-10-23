[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapOutput()

> **getSwapOutput**(`inputMetadata`, `input`, `aReserve`, `bReserve`, `ladder`, `isAInput`, `hint`?): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md) & `object`

The swap output of a banded pool for `input` of one asset, crossing
bands as needed. `aReserve`/`bReserve` are the pool's reserves in
canonical order; `hint` is the indexed `bandCounter` / `activeBand`,
which seeds the witness search and may be stale.

The `lpFee` is the fee the bands kept of the input, summed across the
steps. `priceImpact` is against the active band's opening marginal
price. Throws when the ladder cannot absorb the input.

## Parameters

• **inputMetadata**: `IAssetAmountMetadata`

• **input**: `bigint`

• **aReserve**: `bigint`

• **bReserve**: `bigint`

• **ladder**: [`TLadder`](../type-aliases/TLadder.md)

• **isAInput**: `boolean`

• **hint?**: [`TWitness`](../type-aliases/TWitness.md)

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md) & `object`

## Defined in

[BandedConcentratedLiquidityPool.ts:459](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L459)
