[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: swapSteps()

> **swapSteps**(`ladder`, `A`, `B`, `isAInput`, `dx`, `hint`?): `null` \| [`TFillStep`](../type-aliases/TFillStep.md)[]

Price `dx` across as many bands as it takes, as the scooper's
`swap_steps` does: fill the active band, cross to the next, repeat.
Returns the steps, or null when the ladder cannot absorb `dx` (the
direction is exhausted, or the remainder pays nothing).

## Parameters

• **ladder**: [`TLadder`](../type-aliases/TLadder.md)

• **A**: `bigint`

• **B**: `bigint`

• **isAInput**: `boolean`

• **dx**: `bigint`

• **hint?**: [`TWitness`](../type-aliases/TWitness.md)

## Returns

`null` \| [`TFillStep`](../type-aliases/TFillStep.md)[]

## Defined in

[BandedConcentratedLiquidityPool.ts:389](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L389)
