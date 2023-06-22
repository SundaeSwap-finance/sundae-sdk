# Interface: SwapArguments

[Core](../modules/Core.md).SwapArguments

Arguments for a swap.

## Hierarchy

- [`Arguments`](Core.Arguments.md)

  ↳ **`SwapArguments`**

## Properties

### fundedAsset

• **fundedAsset**: [`IAsset`](Core.IAsset.md)

The asset supplied (this is required to accurately determine the swap direction).

#### Defined in

[@types/datumbuilder.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L112)

___

### ident

• **ident**: `string`

The unique pool identifier.

#### Inherited from

[Arguments](Core.Arguments.md).[ident](Core.Arguments.md#ident)

#### Defined in

[@types/datumbuilder.ts:99](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L99)

___

### orderAddresses

• **orderAddresses**: [`OrderAddresses`](../modules/Core.md#orderaddresses)

The addresses that are allowed to cancel the Order.

#### Inherited from

[Arguments](Core.Arguments.md).[orderAddresses](Core.Arguments.md#orderaddresses)

#### Defined in

[@types/datumbuilder.ts:103](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L103)

___

### scooperFee

• `Optional` **scooperFee**: `bigint`

The fee paid to scoopers. Defaults to 2.5 ADA which is the minimum.

#### Inherited from

[Arguments](Core.Arguments.md).[scooperFee](Core.Arguments.md#scooperfee)

#### Defined in

[@types/datumbuilder.ts:101](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L101)
