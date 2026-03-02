[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IUpdatePoolFeesConfigArgs

The arguments configuration for updating pool LP fees on a V3 pool.

## Extends

- [`IBaseConfig`](IBaseConfig.md)

## Properties

### feeManager?

> `optional` **feeManager**: `string`

Optional new fee manager address.

#### Defined in

[packages/core/src/@types/configs.ts:272](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L272)

***

### fees

> **fees**: [`IFeesConfig`](IFeesConfig.md)

The new LP fees to set on the pool.

#### Defined in

[packages/core/src/@types/configs.ts:267](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L267)

***

### poolIdent

> **poolIdent**: `string`

The pool identifier to update.

#### Defined in

[packages/core/src/@types/configs.ts:262](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L262)

***

### signers?

> `optional` **signers**: `string`[]

Optional signers to attach to the transaction (e.g., fee manager keys).

#### Defined in

[packages/core/src/@types/configs.ts:277](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L277)
