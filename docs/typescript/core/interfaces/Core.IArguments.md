# Interface: IArguments

[Core](../modules/Core.md).IArguments

Base arguments for every datum constructor.

## Hierarchy

- **`IArguments`**

  ↳ [`ISwapArguments`](Core.ISwapArguments.md)

  ↳ [`IWithdrawArguments`](Core.IWithdrawArguments.md)

  ↳ [`IDepositArguments`](Core.IDepositArguments.md)

  ↳ [`IZapArguments`](Core.IZapArguments.md)

## Properties

### ident

• **ident**: `string`

The unique pool identifier.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:138](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L138)

___

### orderAddresses

• **orderAddresses**: [`TOrderAddresses`](../modules/Core.md#torderaddresses)

The addresses that are allowed to cancel the Order.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:140](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L140)

___

### scooperFee

• **scooperFee**: `bigint`

The fee paid to scoopers.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:142](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L142)
