[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculatePinnedDeposit()

> **calculatePinnedDeposit**(`offered`, `reserves`, `totalLp`, `d`): `object`

The deposit target a holder of `offered` can cover, and everything pinned to
it. This is the target-pinned rule the v4 module enforces (`ss_check.ak`,
tag 6), and it is the same shape constant sum uses, stated on `D` instead of
on the value sum `V`:

- the fill declares a `D` delta `t`;
- every reserve moves by `ceil(r_i · t / D_before)`;
- `total_lp` becomes `floor(lp_before · (D_before + t) / D_before)`.

The largest `t` a holder can cover is capped by the scarcest offered asset,
`t = min_i floor(offered_i · D_before / r_i)`. Anything above the pinned
deltas is refunded. Every pool asset must be offered, or `t` is zero and the
deposit can never fill.

The rates do not enter the deltas: a proportional move is proportional in
any units. They enter only through `D`.

## Parameters

• **offered**: `bigint`[]

• **reserves**: `bigint`[]

• **totalLp**: `bigint`

• **d**: `bigint`

## Returns

`object`

### deltas

> **deltas**: `bigint`[]

### generatedLp

> **generatedLp**: `bigint`

### nextTotalLp

> **nextTotalLp**: `bigint`

### shareAfterDeposit

> **shareAfterDeposit**: `Fraction`

### targetDeltaD

> **targetDeltaD**: `bigint`

## Defined in

[V4StableswapPool.ts:497](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L497)
