[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculateDepositN()

> **calculateDepositN**(`amounts`, `reserves`, `prices`, `totalLp`): `object`

The N-asset form of [calculateLiquidity](calculateLiquidity.md), mirroring the v4 contract's
`compute_deposit_n` exactly: a deposit of any mix of the pool's assets is
valued at the fixed prices against the value of ALL reserves —

  generatedLp = Σ(amount_i·price_i) · totalLp / Σ(reserve_i·price_i)

The three arrays must be aligned to the pool's canonical asset order (the
API's `assets`/`quantities`/`prices`). Estimating an N-asset pool's deposit
from just two of its reserves overstates the minted LP — the denominator is
the whole pool's value — which is exactly the mistake this exists to
prevent.

## Parameters

• **amounts**: `bigint`[]

• **reserves**: `bigint`[]

• **prices**: `bigint`[]

• **totalLp**: `bigint`

## Returns

`object`

### generatedLp

> **generatedLp**: `bigint`

### nextTotalLp

> **nextTotalLp**: `bigint`

### shareAfterDeposit

> **shareAfterDeposit**: `Fraction`

## Defined in

[ConstantSumPool.ts:237](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L237)
