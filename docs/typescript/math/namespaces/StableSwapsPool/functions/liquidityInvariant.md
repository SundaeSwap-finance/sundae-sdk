[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: liquidityInvariant()

> **liquidityInvariant**(`assetA`, `assetB`, `linearAmplification`, `newSumInvariant`): `boolean`

Validates that a given sum invariant (D) satisfies the liquidity invariant equation
for the Stableswaps curve. This function checks if D is within the valid range by
evaluating the invariant function at D and D+1.

The liquidity invariant ensures that the curve equation is satisfied:
4A * 4xy * D + D^3 - (4xy * 4A * (x + y) + 4xy * D) should be <= 0 at D and > 0 at D+1

## Parameters

• **assetA**: `bigint`

The reserve amount of asset A (already scaled by RESERVE_PRECISION).

• **assetB**: `bigint`

The reserve amount of asset B (already scaled by RESERVE_PRECISION).

• **linearAmplification**: `bigint`

The amplification coefficient for the pool.

• **newSumInvariant**: `bigint`

The proposed sum invariant (D) to validate.

## Returns

`boolean`

True if the sum invariant satisfies the liquidity invariant equation, false otherwise.

## Defined in

[StableSwapsPool.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L19)
