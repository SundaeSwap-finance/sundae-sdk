---
title: "ProviderSundaeSwap"
---

# ProviderSundaeSwap

This class provides a simple set of useful tooling, but primarily is used to
query data about pools on the SundaeSwap protocol.

## Example

```ts
const query = new QueryProviderSundaeSwap("preview");
const ident = await query.findPoolIdent({
  pair: ["assetIdA", "assetIdB"],
  fee: "0.03"
});

console.log(ident); // "00"
```

## Implements

- [`IQueryProviderClass`](../../Core/interfaces/IQueryProviderClass.md)
