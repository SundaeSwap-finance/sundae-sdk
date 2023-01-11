[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [@types/provider](../modules/types_provider.md) / IPoolQuery

# Interface: IPoolQuery

[@types/provider](../modules/types_provider.md).IPoolQuery

An interface for querying details about a pool.

```ts
const query: IPoolQuery = {
  pair: ["assetIdA", "assetIdB"],
  fee: "0.03"
}
```

**`See`**

[IProviderClass](types_provider.IProviderClass.md)

## Properties

### fee

• **fee**: `string`

The desired pool fee.

#### Defined in

@types/provider.d.ts:46

___

### pair

• **pair**: [`string`, `string`]

The pool pair, as an array of [assetId](types_provider.IPoolDataAsset.md#assetid)

#### Defined in

@types/provider.d.ts:44
