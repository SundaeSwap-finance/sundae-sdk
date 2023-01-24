# Interface: DepositArguments

[Core](../modules/Core.md).DepositArguments

Arguments for depositing a pair of assets into a pool.

## Hierarchy

- [`Arguments`](Core.Arguments.md)

  ↳ **`DepositArguments`**

## Properties

### ident

• **ident**: `string`

The unique pool identifier.

#### Inherited from

[Arguments](Core.Arguments.md).[ident](Core.Arguments.md#ident)

#### Defined in

[@types/datumbuilder.ts:90](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L90)

___

### orderAddresses

• **orderAddresses**: [`OrderAddresses`](../modules/Core.md#orderaddresses)

The addresses that are allowed to cancel the Order.

#### Inherited from

[Arguments](Core.Arguments.md).[orderAddresses](Core.Arguments.md#orderaddresses)

#### Defined in

[@types/datumbuilder.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L94)

___

### scooperFee

• `Optional` **scooperFee**: `bigint`

The fee paid to scoopers. Defaults to 2.5 ADA which is the minimum.

#### Inherited from

[Arguments](Core.Arguments.md).[scooperFee](Core.Arguments.md#scooperfee)

#### Defined in

[@types/datumbuilder.ts:92](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L92)