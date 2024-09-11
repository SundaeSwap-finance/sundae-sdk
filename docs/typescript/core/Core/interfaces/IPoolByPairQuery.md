[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolByPairQuery

An interface for querying details about a pool.

```ts
const query: IPoolByPairQuery = {
  pair: ["assetIdA", "assetIdB"],
  fee: "0.03"
}
```

## Properties

### fee

> **fee**: `string`

The desired pool fee as a percentage string.

#### Defined in

[packages/core/src/@types/queryprovider.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L30)

***

### pair

> **pair**: [`string`, `string`]

The pool pair, as an array of [IPoolDataAsset.assetId](IPoolDataAsset.md#assetid)

#### Defined in

[packages/core/src/@types/queryprovider.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L28)
