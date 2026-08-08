[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculatePinnedDeposit()

> **calculatePinnedDeposit**(`offered`, `reserves`, `prices`, `totalLp`): `object`

The target-pinned deposit — what the deployed CS validator (cs_check tag 6)
actually accepts, and what the scooper builds. Asymmetric deposits are
disallowed on-chain: the fill declares a value delta `t` and every asset's
contribution is ceil-pinned to `ceil(r_i·t/V_b)`, with total LP
floor-pinned to `floor(lp_b·(V_b+t)/V_b)`. Given what the user offers, the
largest fillable t is capped by the SCARCEST asset —
`t = min_i floor(offered_i·V_b/r_i)` — and anything above the pinned
deltas is returned as surplus. Every pool asset must be offered (> 0) or
t is zero and the deposit can never fill.

Contrast with `calculateDepositN`, which is the plain value formula:
it matches the pin only for exactly proportional offers and OVERSTATES the
mint otherwise — using it for `minReceived` makes non-proportional orders
unfillable.

## Parameters

• **offered**: `bigint`[]

• **reserves**: `bigint`[]

• **prices**: `bigint`[]

• **totalLp**: `bigint`

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

### targetDeltaV

> **targetDeltaV**: `bigint`

## Defined in

[ConstantSumPool.ts:256](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L256)
