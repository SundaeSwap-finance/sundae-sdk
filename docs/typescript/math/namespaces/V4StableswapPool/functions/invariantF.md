[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: invariantF()

> **invariantF**(`x`, `y`, `amp`, `d`): `bigint`

`f(D)` from the on-chain `liquidity_invariant`. It is ≤ 0 when `D` is at or
below the curve. All arguments are rated and scaled.

## Parameters

• **x**: `bigint`

• **y**: `bigint`

• **amp**: `bigint`

• **d**: `bigint`

## Returns

`bigint`

## Defined in

[V4StableswapPool.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L93)
