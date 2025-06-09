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

[packages/core/src/@types/datumbuilder.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L180)

***

### ident

> **ident**: `string`

The unique pool identifier.

#### Inherited from

[`IArguments`](IArguments.md).[`ident`](IArguments.md#ident)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:167](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L167)

***

### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses that are allowed to cancel the Order.

#### Inherited from

[`IArguments`](IArguments.md).[`orderAddresses`](IArguments.md#orderaddresses)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:169](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L169)

***

### scooperFee

> **scooperFee**: `bigint`

The fee paid to scoopers.

#### Inherited from

[`IArguments`](IArguments.md).[`scooperFee`](IArguments.md#scooperfee)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:171](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L171)
