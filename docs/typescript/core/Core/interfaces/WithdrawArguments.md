---
title: "WithdrawArguments"
---

# WithdrawArguments

Arguments for a withdraw.

## Hierarchy

- [`Arguments`](Arguments.md).**WithdrawArguments**

## Properties

### ident

> `string`

The unique pool identifier.

Inherited from: [Arguments](Arguments.md).[ident](Arguments.md#ident)

Defined in:  [@types/datumbuilder.ts:98](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L98)

### orderAddresses

> [`OrderAddresses`](../types/OrderAddresses.md)

The addresses that are allowed to cancel the Order.

Inherited from: [Arguments](Arguments.md).[orderAddresses](Arguments.md#orderaddresses)

Defined in:  [@types/datumbuilder.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L102)

### scooperFee?

> `bigint`

The fee paid to scoopers. Defaults to 2.5 ADA which is the minimum.

Inherited from: [Arguments](Arguments.md).[scooperFee](Arguments.md#scooperfee)

Defined in:  [@types/datumbuilder.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L100)

### suppliedLPAsset

> [`IAsset`](IAsset.md)

The LP tokens to send to the pool.

Defined in:  [@types/datumbuilder.ts:119](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L119)
