[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getPrice()

> **getPrice**(`aReserve`, `bReserve`, `laf`, `v2Options`?): `Fraction`

Calculates the current price (exchange rate) of asset A in terms of asset B for a Stableswaps pool.
The price is derived from the Stableswaps curve equation and takes into account the amplification factor.

The calculation uses the formula:
price = (xpA + (dR * aReserve) / bReserve) / (xpA + dR)
where xpA = (Ann * aReserve) / A_PRECISION and dR is derived from the sum invariant

## Parameters

• **aReserve**: `bigint`

The current reserve amount of asset A in the pool.

• **bReserve**: `bigint`

The current reserve amount of asset B in the pool.

• **laf**: `bigint`

The linear amplification factor of the pool.

• **v2Options?**: [`IStableswapsV2Options`](../interfaces/IStableswapsV2Options.md)

Optional V2 parameters (prescale).

## Returns

`Fraction`

The price of asset A in terms of asset B as a Fraction.

## Defined in

[StableSwapsPool.ts:488](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L488)
