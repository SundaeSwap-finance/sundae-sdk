[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: reservesAt()

> **reservesAt**(`l`, `x`, `k`, `s`): `object`

The exact reserves a ladder holds at counter `x` with the price at
sqrt-price `s`, which must lie in band `k`: what a pool creator deposits
for a chosen shape, scale and launch price. The result is floored, so
`findWitness` must still be run on it to learn the counter the chain
derives — usually `x`, but rounding can move it.

## Parameters

• **l**: [`TLadder`](../type-aliases/TLadder.md)

• **x**: `bigint`

• **k**: `number`

• **s**: [`TFrac`](../type-aliases/TFrac.md)

## Returns

`object`

### A

> **A**: `bigint`

### B

> **B**: `bigint`

## Defined in

[BandedConcentratedLiquidityPool.ts:579](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L579)
