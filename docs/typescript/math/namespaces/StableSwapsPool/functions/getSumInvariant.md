[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSumInvariant()

> **getSumInvariant**(`a`, `x`, `y`): `bigint`

Calculates the sum invariant (D) for a Stableswaps pool using Newton's method.
The sum invariant represents the total value in the pool and is used to determine
the fair exchange rate between assets.

This function iteratively solves for D in the Stableswaps invariant equation:
Ann * sum + D_p * 2 = Ann * D + D_p * 3
where D_p = D^3 / (4 * x * y) and Ann = A * n^n (with n=2)

The iteration continues until convergence (difference <= 1) or fails after 255 iterations.

## Parameters

• **a**: `bigint`

The amplification coefficient for the pool (will be scaled by A_PRECISION).

• **x**: `bigint`

The reserve amount of the first asset (will be scaled by RESERVE_PRECISION).

• **y**: `bigint`

The reserve amount of the second asset (will be scaled by RESERVE_PRECISION).

## Returns

`bigint`

The calculated sum invariant (D) scaled by RESERVE_PRECISION.

## Throws

If the amplification coefficient is not positive.

## Throws

If convergence fails after 255 iterations.

## Defined in

[StableSwapsPool.ts:83](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L83)
