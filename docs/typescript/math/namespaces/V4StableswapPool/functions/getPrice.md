[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getPrice()

> **getPrice**(`amp`, `aReserve`, `bReserve`, `rateA`, `rateB`): `Fraction`

The pool's marginal price as raw units of asset A per raw unit of asset B.
Use it where a constant-product pool would use the reserve ratio: for a
stableswap pool the reserve ratio is not the price, because the curve holds
the price near par across a wide band of ratios.

The result is in raw (undecimalized) units. Adjust for the two assets'
decimals before display.

## Parameters

• **amp**: `bigint`

• **aReserve**: `bigint`

• **bReserve**: `bigint`

• **rateA**: `bigint` = `...`

• **rateB**: `bigint` = `...`

## Returns

`Fraction`

## Defined in

[V4StableswapPool.ts:297](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L297)
