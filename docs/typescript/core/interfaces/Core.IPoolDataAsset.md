# Interface: IPoolDataAsset

[Core](../modules/Core.md).IPoolDataAsset

Asset data returned from [findPoolData](Core.IQueryProviderClass.md#findpooldata).

## Properties

### assetId

• **assetId**: `string`

The hex encoded asset ID, separating the Policy ID from the Asset Name.

**`Example`**

```ts
POLICY_ID_HEX.ASSET_NAME_HEX
```

#### Defined in

[@types/queryprovider.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L87)

___

### decimals

• **decimals**: `number`

The registered decimal places of the asset.

#### Defined in

[@types/queryprovider.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L89)
