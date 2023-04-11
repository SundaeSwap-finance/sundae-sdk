---
title: "IPoolQuery"
---

# IPoolQuery

An interface for querying details about a pool.

```ts
const query: IPoolQuery = {
  pair: ["assetIdA", "assetIdB"],
  fee: "0.03"
}
```

## See

[IQueryProviderClass](IQueryProviderClass.md)

## Properties

### fee

> `string`

The desired pool fee as a percentage string.

Defined in:  [@types/queryprovider.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L55)

### pair

> [`string`, `string`]

The pool pair, as an array of [assetId](IPoolDataAsset.md#assetid)

Defined in:  [@types/queryprovider.ts:53](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L53)
