# Interface: Arguments

[Core](../modules/Core.md).Arguments

Base arguments for every datum constructor.

## Hierarchy

- **`Arguments`**

  ↳ [`SwapArguments`](Core.SwapArguments.md)

  ↳ [`DepositArguments`](Core.DepositArguments.md)

## Properties

### ident

• **ident**: `string`

The unique pool identifier.

#### Defined in

[@types/datumbuilder.ts:90](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L90)

___

### orderAddresses

• **orderAddresses**: [`OrderAddresses`](../modules/Core.md#orderaddresses)

The addresses that are allowed to cancel the Order.

#### Defined in

[@types/datumbuilder.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L94)

___

### scooperFee

• `Optional` **scooperFee**: `bigint`

The fee paid to scoopers. Defaults to 2.5 ADA which is the minimum.

#### Defined in

[@types/datumbuilder.ts:92](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L92)
