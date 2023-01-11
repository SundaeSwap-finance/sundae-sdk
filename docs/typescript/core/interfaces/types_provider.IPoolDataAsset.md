[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [@types/provider](../modules/types_provider.md) / IPoolDataAsset

# Interface: IPoolDataAsset

[@types/provider](../modules/types_provider.md).IPoolDataAsset

Asset data returned from [findPoolData](types_provider.IProviderClass.md#findpooldata).

## Properties

### assetId

• **assetId**: `string`

The hex encoded asset ID, separating the Policy ID from the Asset Name.

**`Example`**

```ts
POLICY_ID_HEX.ASSET_NAME_HEX
```

#### Defined in

@types/provider.d.ts:59

___

### decimals

• **decimals**: `number`

The registered decimal places of the asset.

#### Defined in

@types/provider.d.ts:61
