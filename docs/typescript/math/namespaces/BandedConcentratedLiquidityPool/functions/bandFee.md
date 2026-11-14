[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: bandFee()

> **bandFee**(`dx`, `fee`): `bigint`

The band fee on a step's real input `dx`: `ceil(dx * num / den)`.
Mirrors `cl_check.band_fee` (sundae-v4 #228, SV4-006). The chain charges
it per transcript step and rounds it UP, so a step below `den / num`
units still pays one unit. A zero rate charges nothing.

## Parameters

• **dx**: `bigint`

• **fee**: [`TFrac`](../type-aliases/TFrac.md)

## Returns

`bigint`

## Defined in

[BandedConcentratedLiquidityPool.ts:324](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L324)
