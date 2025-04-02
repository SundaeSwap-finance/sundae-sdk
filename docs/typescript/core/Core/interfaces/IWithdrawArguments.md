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

[packages/core/src/@types/datumbuilder.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L139)

***

### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses that are allowed to cancel the Order.

#### Inherited from

[`IArguments`](IArguments.md).[`orderAddresses`](IArguments.md#orderaddresses)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:141](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L141)

***

### scooperFee

> **scooperFee**: `bigint`

The fee paid to scoopers.

#### Inherited from

[`IArguments`](IArguments.md).[`scooperFee`](IArguments.md#scooperfee)

#### Defined in

[packages/core/src/@types/datumbuilder.ts:143](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L143)

***

### suppliedLPAsset

> **suppliedLPAsset**: `AssetAmount`\<`IAssetAmountMetadata`\>

The LP tokens to send to the pool.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L160)
