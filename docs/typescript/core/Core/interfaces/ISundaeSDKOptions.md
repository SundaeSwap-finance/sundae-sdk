[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ISundaeSDKOptions

The SundaeSDK options argument when creating a new instance.

## Properties

### blazeInstance

> **blazeInstance**: `Blaze`\<`Provider`, `Wallet$1`\>

A built blaze instance.

#### Defined in

[packages/core/src/@types/index.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L16)

***

### customQueryProvider?

> `optional` **customQueryProvider**: [`QueryProvider`](../classes/QueryProvider.md)

An optional custom QueryProvider for general protocol queries.

#### Defined in

[packages/core/src/@types/index.ts:10](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L10)

***

### debug?

> `optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Defined in

[packages/core/src/@types/index.ts:12](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L12)

***

### minLockAda?

> `optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Defined in

[packages/core/src/@types/index.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L14)

***

### network?

> `optional` **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

Override network detection (required for preprod, since Blaze can't distinguish it from preview).

#### Defined in

[packages/core/src/@types/index.ts:18](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L18)
