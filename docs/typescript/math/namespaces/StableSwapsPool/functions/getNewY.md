[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getNewY()

> **getNewY**(`newX`, `aRaw`, `sumInvariant`): `bigint`

Calculates the new Y reserve value given a new X reserve value and the sum invariant.
This function uses Newton's method to iteratively solve for Y in the Stableswaps equation
while maintaining the pool's invariant (D).

The function solves: Y^2 + (sum + (D * A_PRECISION) / (2 * Ann) - D) * Y - c = 0
where c is derived from D and the pool parameters.

This is used during swaps to determine the output reserve after an input is added.

## Parameters

• **newX**: `bigint`

The new reserve amount for asset X (will be scaled by RESERVE_PRECISION internally).

• **aRaw**: `bigint`

The raw amplification coefficient for the pool (will be scaled by A_PRECISION).

• **sumInvariant**: `bigint`

The pool's sum invariant (D), already scaled.

## Returns

`bigint`

The calculated Y reserve value scaled by RESERVE_PRECISION.

## Throws

If convergence fails after 255 iterations.

## Defined in

[StableSwapsPool.ts:150](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L150)
