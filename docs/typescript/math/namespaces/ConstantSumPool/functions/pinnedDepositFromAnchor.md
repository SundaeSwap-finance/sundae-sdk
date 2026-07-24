[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: pinnedDepositFromAnchor()

> **pinnedDepositFromAnchor**(`anchorIndex`, `anchorAmount`, `reserves`, `prices`): `bigint`[]

The per-asset amounts a pinned deposit needs when the user anchors on one
asset's amount: t from the anchor (`floor(anchor·V_b/r_anchor)`), every
delta ceil-pinned to it. Drives proportional auto-fill in deposit forms.

## Parameters

• **anchorIndex**: `number`

• **anchorAmount**: `bigint`

• **reserves**: `bigint`[]

• **prices**: `bigint`[]

## Returns

`bigint`[]

## Defined in

[ConstantSumPool.ts:310](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L310)
