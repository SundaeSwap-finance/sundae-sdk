[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolQueryLegacy

Legacy query interface for the legacy API.

## Properties

### fee

> **fee**: `string`

The desired pool fee as a percentage string.

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L40)

***

### ident?

> `optional` **ident**: `string`

Narrow the results even more if you want to get by ident.

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L42)

***

### pair

> **pair**: [`string`, `string`]

The pool pair, as an array of [IPoolDataAsset.assetId](IPoolDataAsset.md#assetid)

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:38](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L38)
