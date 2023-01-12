# Interface: IPoolDataAsset

Asset data returned from [findPoolData](IProviderClass.md#findpooldata).

## Properties

### assetId

• **assetId**: `string`

The hex encoded asset ID, separating the Policy ID from the Asset Name.

**`Example`**

```ts
POLICY_ID_HEX.ASSET_NAME_HEX
```

#### Defined in

[@types/provider.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/d486512/packages/core/src/@types/provider.ts#L57)

___

### decimals

• **decimals**: `number`

The registered decimal places of the asset.

#### Defined in

[@types/provider.ts:59](https://github.com/SundaeSwap-finance/sundae-sdk/blob/d486512/packages/core/src/@types/provider.ts#L59)
