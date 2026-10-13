[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getPrice()

> **getPrice**(`aReserve`, `bReserve`, `laf`): `Fraction`

The pool's marginal price as raw units of asset A per raw unit of asset B,
|dx/dy| at the current reserves. This is the "ideal" price that swap price
impact is measured against.

Derived from the Stableswaps invariant 4A(x + y) + D = 4AD + D^3 / (4xy):
price = (xpA + (dR * aReserve) / bReserve) / (xpA + dR)
where xpA = 4 * laf * aReserve and dR = D^3 / (4 * aReserve * bReserve)

## Parameters

• **aReserve**: `bigint`

The current reserve amount of asset A in the pool.

• **bReserve**: `bigint`

The current reserve amount of asset B in the pool.

• **laf**: `bigint`

The linear amplification factor of the pool.

## Returns

`Fraction`

Raw A per raw B at the current reserves.

## Defined in

[StableSwapsPool.ts:412](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L412)
