# Interface: IPoolQuery

An interface for querying details about a pool.

```ts
const query: IPoolQuery = {
  pair: ["assetIdA", "assetIdB"],
  fee: "0.03"
}
```

**`See`**

[IProviderClass](IProviderClass.md)

## Properties

### fee

• **fee**: `string`

The desired pool fee.

#### Defined in

[@types/provider.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/ef3cd12/packages/core/src/@types/provider.ts#L44)

___

### pair

• **pair**: [`string`, `string`]

The pool pair, as an array of [assetId](IPoolDataAsset.md#assetid)

#### Defined in

[@types/provider.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/ef3cd12/packages/core/src/@types/provider.ts#L42)