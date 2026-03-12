[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ISundaeSDKOptions

The SundaeSDK options argument when creating a new instance.

## Properties

### blazeInstance

> **blazeInstance**: `Blaze`\<`Provider`, `Wallet$1`\>

A built blaze instance.

#### Defined in

[packages/core/src/@types/index.ts:15](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L15)

***

### customQueryProvider?

> `optional` **customQueryProvider**: [`QueryProvider`](../classes/QueryProvider.md)

An optional custom QueryProvider for general protocol queries.

#### Defined in

[packages/core/src/@types/index.ts:9](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L9)

***

### debug?

> `optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Defined in

[packages/core/src/@types/index.ts:11](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L11)

***

### minLockAda?

> `optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Defined in

[packages/core/src/@types/index.ts:13](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L13)
