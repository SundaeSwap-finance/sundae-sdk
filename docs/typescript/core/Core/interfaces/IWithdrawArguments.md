[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IWithdrawArguments

Arguments for a withdraw.

## Extends

- [`IArguments`](IArguments.md)

## Properties

### ident

> **ident**: `string`

The unique pool identifier.

#### Inherited from

[`IArguments`](IArguments.md).[`ident`](IArguments.md#ident)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:168](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L168)

***

### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses that are allowed to cancel the Order.

#### Inherited from

[`IArguments`](IArguments.md).[`orderAddresses`](IArguments.md#orderaddresses)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:170](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L170)

***

### scooperFee

> **scooperFee**: `bigint`

The fee paid to scoopers.

#### Inherited from

[`IArguments`](IArguments.md).[`scooperFee`](IArguments.md#scooperfee)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L172)

***

### suppliedLPAsset

> **suppliedLPAsset**: `AssetAmount`\<`IAssetAmountMetadata`\>

The LP tokens to send to the pool.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:189](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L189)
