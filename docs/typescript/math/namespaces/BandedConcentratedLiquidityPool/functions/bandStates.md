[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: bandStates()

> **bandStates**(`ladder`, `aReserve`, `bReserve`, `hint`?): `null` \| [`TBandState`](../type-aliases/TBandState.md)[]

Every band's state at the pool's reserves: a band below the price holds
only B, a band above it only A, the active band some of both. Null when
the reserves sit on no point of the ladder.

## Parameters

• **ladder**: [`TLadder`](../type-aliases/TLadder.md)

• **aReserve**: `bigint`

• **bReserve**: `bigint`

• **hint?**: [`TWitness`](../type-aliases/TWitness.md)

## Returns

`null` \| [`TBandState`](../type-aliases/TBandState.md)[]

## Defined in

[BandedConcentratedLiquidityPool.ts:531](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L531)
