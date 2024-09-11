[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ISwapArguments

Arguments for a swap.

## Extends

- [`IArguments`](IArguments.md)

## Properties

### fundedAsset

> **fundedAsset**: `AssetAmount`\<`IAssetAmountMetadata`\>

The asset supplied (this is required to accurately determine the swap direction).

#### Defined in

[packages/core/src/@types/datumbuilder.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L151)

***

### ident

> **ident**: `string`

The unique pool identifier.

#### Inherited from

[`IArguments`](IArguments.md).[`ident`](IArguments.md#ident)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:138](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L138)

***

### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses that are allowed to cancel the Order.

#### Inherited from

[`IArguments`](IArguments.md).[`orderAddresses`](IArguments.md#orderaddresses)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:140](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L140)

***

### scooperFee

> **scooperFee**: `bigint`

The fee paid to scoopers.

#### Inherited from

[`IArguments`](IArguments.md).[`scooperFee`](IArguments.md#scooperfee)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:142](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L142)
