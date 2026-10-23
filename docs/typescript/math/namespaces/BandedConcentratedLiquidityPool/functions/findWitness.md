[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: findWitness()

> **findWitness**(`ladder`, `A`, `B`, `hint`?): `null` \| [`TWitness`](../type-aliases/TWitness.md)

The witness `(X, k)` for a pool's reserves. A hint (the indexed
`bandCounter` / `activeBand`) is checked first and seeds the search in
its band; a stale hint falls back to every band. Null when the reserves
sit on no point of the ladder — the chain would reject them too.

## Parameters

• **ladder**: [`TLadder`](../type-aliases/TLadder.md)

• **A**: `bigint`

• **B**: `bigint`

• **hint?**: [`TWitness`](../type-aliases/TWitness.md)

## Returns

`null` \| [`TWitness`](../type-aliases/TWitness.md)

## Defined in

[BandedConcentratedLiquidityPool.ts:262](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L262)
