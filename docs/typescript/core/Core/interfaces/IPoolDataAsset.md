[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolDataAsset

Asset data returned from [Core.QueryProvider.findPoolData](../classes/QueryProvider.md#findpooldata).

## Properties

### assetId

> **assetId**: `string`

The hex encoded asset ID, separating the Policy ID from the Asset Name.

#### Example

```ts
POLICY_ID_HEX.ASSET_NAME_HEX
```

#### Defined in

[packages/core/src/@types/queryprovider.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L51)

***

### decimals

> **decimals**: `number`

The registered decimal places of the asset.

#### Defined in

[packages/core/src/@types/queryprovider.ts:53](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L53)
