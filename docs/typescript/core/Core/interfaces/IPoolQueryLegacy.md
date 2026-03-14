[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolQueryLegacy

Legacy query interface for the legacy API.

## Properties

### fee

> **fee**: `string`

The desired pool fee as a percentage string.

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L41)

***

### ident?

> `optional` **ident**: `string`

Narrow the results even more if you want to get by ident.

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L43)

***

### pair

> **pair**: [`string`, `string`]

The pool pair, as an array of [IPoolDataAsset.assetId](IPoolDataAsset.md#assetid)

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L39)
