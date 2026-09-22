[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: pinnedDepositFromAnchor()

> **pinnedDepositFromAnchor**(`anchorIndex`, `anchorAmount`, `reserves`, `d`): `bigint`[]

The per-asset amounts a pinned deposit needs when the user anchors on one
asset's amount: `t` from the anchor (`floor(anchor · D / r_anchor)`), every
other delta ceil-pinned to it. Drives proportional auto-fill in deposit
forms.

## Parameters

• **anchorIndex**: `number`

• **anchorAmount**: `bigint`

• **reserves**: `bigint`[]

• **d**: `bigint`

## Returns

`bigint`[]

## Defined in

[V4StableswapPool.ts:621](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L621)
