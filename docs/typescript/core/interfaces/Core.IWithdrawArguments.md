# Interface: IWithdrawArguments

[Core](../modules/Core.md).IWithdrawArguments

Arguments for a withdraw.

## Hierarchy

- [`IArguments`](Core.IArguments.md)

  ↳ **`IWithdrawArguments`**

## Properties

### ident

• **ident**: `string`

The unique pool identifier.

#### Inherited from

[IArguments](Core.IArguments.md).[ident](Core.IArguments.md#ident)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:138](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L138)

___

### orderAddresses

• **orderAddresses**: [`TOrderAddresses`](../modules/Core.md#torderaddresses)

The addresses that are allowed to cancel the Order.

#### Inherited from

[IArguments](Core.IArguments.md).[orderAddresses](Core.IArguments.md#orderaddresses)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:140](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L140)

___

### scooperFee

• **scooperFee**: `bigint`

The fee paid to scoopers.

#### Inherited from

[IArguments](Core.IArguments.md).[scooperFee](Core.IArguments.md#scooperfee)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:142](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L142)

___

### suppliedLPAsset

• **suppliedLPAsset**: `AssetAmount`\<`IAssetAmountMetadata`\>

The LP tokens to send to the pool.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:159](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L159)
