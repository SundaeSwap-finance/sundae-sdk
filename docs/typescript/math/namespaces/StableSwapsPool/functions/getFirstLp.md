[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getFirstLp()

> **getFirstLp**(`a`, `b`, `laf`, `v2Options`?): `bigint`

Calculates the initial LP token amount for the first liquidity provision to a pool.
This is used when bootstrapping a new pool with initial reserves of assets A and B.

The LP tokens minted are derived from the sum invariant (D) divided by the reserve precision,
effectively representing the pool's total value at inception.

## Parameters

• **a**: `bigint`

The initial amount of token A being deposited.

• **b**: `bigint`

The initial amount of token B being deposited.

• **laf**: `bigint`

The linear amplification factor for the pool.

• **v2Options?**: [`IStableswapsV2Options`](../interfaces/IStableswapsV2Options.md)

Optional V2 parameters (prescale).

## Returns

`bigint`

The amount of LP tokens to mint for the first liquidity provision.

## Defined in

[StableSwapsPool.ts:203](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L203)
