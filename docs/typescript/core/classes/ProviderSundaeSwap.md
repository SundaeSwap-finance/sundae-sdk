# Class: ProviderSundaeSwap

This class provides a simple set of useful tooling, but primarily is used to
query data about pools on the SundaeSwap protocol.

**`Example`**

```ts
const provider = new ProviderSundaeSwap("preview");
const ident = await provider.findPoolIdent({
  pair: ["assetIdA", "assetIdB"],
  fee: "0.03"
});

console.log(ident); // "00"
```

## Implements

- [`IProviderClass`](../interfaces/IProviderClass.md)
