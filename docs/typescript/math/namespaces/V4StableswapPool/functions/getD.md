[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getD()

> **getD**(`amp`, `aReserve`, `bReserve`, `rateA`, `rateB`): `bigint`

The sum invariant `D` of a two-asset v4 stableswap pool: the largest integer
that satisfies the curve on the rated, scaled reserves. Newton from
`D = x + y`, then a ±1 fix-up.

`D` carries the `rate · CALC_PRECISION` scale — it is not a token amount.

## Parameters

• **amp**: `bigint`

The pool's `linear_amplification` (`A`).

• **aReserve**: `bigint`

The pool's reserve of asset A, in token units.

• **bReserve**: `bigint`

The pool's reserve of asset B, in token units.

• **rateA**: `bigint` = `...`

The pool's rate for asset A (from the stableswap config).

• **rateB**: `bigint` = `...`

The pool's rate for asset B.

## Returns

`bigint`

## Defined in

[V4StableswapPool.ts:140](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L140)
