# Interface: IAsset

Basic asset structure with the amount.

## Properties

### amount

• **amount**: [`AssetAmount`](../classes/AssetAmount.md)

An instance of the asset amount including the decimal place.

#### Defined in

[@types/utilities.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L47)

___

### assetID

• **assetID**: `string`

The hex encoded asset string, separating the Policy ID from the Asset Name with a period.

**`Example`**

```ts
POLICY_ID.ASSET_NAME
```

#### Defined in

[@types/utilities.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L45)
