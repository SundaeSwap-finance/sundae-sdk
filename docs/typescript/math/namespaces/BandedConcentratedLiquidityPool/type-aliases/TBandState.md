[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TBandState

> **TBandState**: `object`

What each band holds at the pool's reserves.

## Type declaration

### active

> **active**: `boolean`

### liquidity

> **liquidity**: `bigint`

### quantities

> **quantities**: [`bigint`, `bigint`]

The band's reserves in canonical order. The bands sum to the pool's reserves.

## Defined in

[BandedConcentratedLiquidityPool.ts:519](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L519)
