[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IArguments

Base arguments for every datum constructor.

## Extended by

- [`ISwapArguments`](ISwapArguments.md)
- [`IWithdrawArguments`](IWithdrawArguments.md)
- [`IDepositArguments`](IDepositArguments.md)
- [`IZapArguments`](IZapArguments.md)

## Properties

### ident

> **ident**: `string`

The unique pool identifier.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L139)

***

### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses that are allowed to cancel the Order.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:141](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L141)

***

### scooperFee

> **scooperFee**: `bigint`

The fee paid to scoopers.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:143](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L143)
