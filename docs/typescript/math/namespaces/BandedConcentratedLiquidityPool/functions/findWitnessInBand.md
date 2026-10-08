[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: findWitnessInBand()

> **findWitnessInBand**(`l`, `A`, `B`, `k`, `hint`?): `null` \| [`TWitness`](../type-aliases/TWitness.md)

The witness in band k, seeded at `hint` when given: the counter only
grows along a swap, so the doubling search starts from the previous
witness. `lo` is the largest x with non-negative residuals and G ≥ 0,
and a witness is such an x whose successor fails G, so the scan walks
DOWN from `lo` first. Mirrors `banded_math::find_witness_in_band_from`.

## Parameters

• **l**: [`TIndexedLadder`](../type-aliases/TIndexedLadder.md)

• **A**: `bigint`

• **B**: `bigint`

• **k**: `number`

• **hint?**: `bigint`

## Returns

`null` \| [`TWitness`](../type-aliases/TWitness.md)

## Defined in

[BandedConcentratedLiquidityPool.ts:214](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L214)
