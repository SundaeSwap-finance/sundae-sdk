# Class: QueryProviderSundaeSwapLegacy

[Core](../modules/Core.md).QueryProviderSundaeSwapLegacy

This class provides a simple set of useful tooling, but primarily is used to
query data about pools on the SundaeSwap protocol.

**`Example`**

```ts
const query = new QueryProviderSundaeSwapLegacy("preview");
const { ident } = await query.findPoolData({
  pair: [assetAId, assetBId],
  fee: "0.03"
});

console.log(ident); // "02"
```

## Implements

- [`QueryProvider`](Core.QueryProvider.md)
