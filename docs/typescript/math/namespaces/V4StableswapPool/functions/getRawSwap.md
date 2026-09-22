[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getRawSwap()

> **getRawSwap**(`amp`, `d`, `inAfter`, `outBefore`, `rateIn`, `rateOut`): `bigint`

The raw swap output: the scaled, pre-fee amount the curve releases when the
given reserve becomes `inAfter` and the taken reserve starts at `outBefore`,
at the pre-swap `d`. It is the largest such amount the exchange invariant
admits — one unit more leaves the pool below the curve — and it is at or
below the exact real-valued output, so it never over-quotes.

The result carries the `rate · CALC_PRECISION` scale. Divide by
`rateOut · CALC_PRECISION` to get the gross output in token units.

## Parameters

• **amp**: `bigint`

The pool's `linear_amplification` (`A`), the raw stored integer.

• **d**: `bigint`

The pre-swap sum invariant, from [getD](getD.md).

• **inAfter**: `bigint`

The given asset's reserve after the input arrives, in token units.

• **outBefore**: `bigint`

The taken asset's reserve before the swap, in token units.

• **rateIn**: `bigint` = `...`

The pool's rate for the given asset.

• **rateOut**: `bigint` = `...`

The pool's rate for the taken asset.

## Returns

`bigint`

## Defined in

[V4StableswapPool.ts:244](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L244)
