[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: invariantG()

> **invariantG**(`x`, `y`, `amp`, `d`): `bigint`

`g(y)` from the on-chain `exchange_invariant`. It is ≥ 0 when the pool keeps
enough of the taken asset. `g` is symmetric in `x` and `y`, which is what
lets [getSwapInput](getSwapInput.md) reuse the same solver in the other direction.

## Parameters

• **x**: `bigint`

• **y**: `bigint`

• **amp**: `bigint`

• **d**: `bigint`

## Returns

`bigint`

## Defined in

[V4StableswapPool.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L107)
