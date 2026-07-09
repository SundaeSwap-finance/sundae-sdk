[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: QueryProviderSundaeSwap

This class provides a simple set of useful tooling, but primarily is used to
query data about pools on the SundaeSwap protocol.

## Example

```ts
const query = new QueryProviderSundaeSwap("preview");
const { ident } = await query.findPoolData({
  ident: "02"
});

console.log(ident); // "02"
```

## Implements

- [`QueryProvider`](QueryProvider.md)

## Methods

### findOpenOrderDatum()

> **findOpenOrderDatum**(`utxo`): `Promise`\<`object`\>

Finds the associated UTXO data of an open order.

#### Parameters

• **utxo**: [`TUTXO`](../type-aliases/TUTXO.md)

The transaction hash and index of the open order in the escrow contract.

#### Returns

`Promise`\<`object`\>

##### datum

> **datum**: `string`

##### datumHash

> **datumHash**: `string` = `res.data.utxo.datumHash`

#### Implementation of

[`QueryProvider`](QueryProvider.md).[`findOpenOrderDatum`](QueryProvider.md#findopenorderdatum)

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:613](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L613)

***

### findPoolData()

Finds a matching pool on the SundaeSwap protocol.

#### findPoolData(identArgs)

> **findPoolData**(`identArgs`): `Promise`\<[`IPoolData`](../interfaces/IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

• **identArgs**: [`IPoolByIdentQuery`](../interfaces/IPoolByIdentQuery.md)

##### Returns

`Promise`\<[`IPoolData`](../interfaces/IPoolData.md)\>

Returns the queried pool's data.

##### Implementation of

[`QueryProvider`](QueryProvider.md).[`findPoolData`](QueryProvider.md#findpooldata)

##### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:505](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L505)

#### findPoolData(assetArgs)

> **findPoolData**(`assetArgs`): `Promise`\<[`IPoolData`](../interfaces/IPoolData.md)[]\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

• **assetArgs**: [`IPoolByAssetQuery`](../interfaces/IPoolByAssetQuery.md)

##### Returns

`Promise`\<[`IPoolData`](../interfaces/IPoolData.md)[]\>

Returns the queried pool's data.

##### Implementation of

`QueryProvider.findPoolData`

##### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:506](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L506)

#### findPoolData(assetPairArgs)

> **findPoolData**(`assetPairArgs`): `Promise`\<[`IPoolData`](../interfaces/IPoolData.md)[]\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

• **assetPairArgs**: [`IPoolByPairQuery`](../interfaces/IPoolByPairQuery.md)

##### Returns

`Promise`\<[`IPoolData`](../interfaces/IPoolData.md)[]\>

Returns the queried pool's data.

##### Implementation of

`QueryProvider.findPoolData`

##### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:507](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L507)

#### findPoolData(searchArgs)

> **findPoolData**(`searchArgs`): `Promise`\<[`IPoolData`](../interfaces/IPoolData.md)[]\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

• **searchArgs**: [`IPoolBySearchTermQuery`](../interfaces/IPoolBySearchTermQuery.md)

##### Returns

`Promise`\<[`IPoolData`](../interfaces/IPoolData.md)[]\>

Returns the queried pool's data.

##### Implementation of

`QueryProvider.findPoolData`

##### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:508](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L508)

***

### getProtocolParamsWithScriptHashes()

> **getProtocolParamsWithScriptHashes**(`version`): `Promise`\<[`ISundaeProtocolParams`](../interfaces/ISundaeProtocolParams.md)[]\>

Retrieves the script hashes for all available Protocols.

#### Parameters

• **version**: `undefined`

The protocol script hashes.

#### Returns

`Promise`\<[`ISundaeProtocolParams`](../interfaces/ISundaeProtocolParams.md)[]\>

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:649](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L649)

***

### getProtocolParamsWithScripts()

> **getProtocolParamsWithScripts**(`version`): `Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/ISundaeProtocolParamsFull.md)[]\>

Retrieves the script hashes for all available Protocols.

#### Parameters

• **version**: `undefined`

The protocol script hashes.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/ISundaeProtocolParamsFull.md)[]\>

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:712](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L712)

***

### getProtocolSettings()

> **getProtocolSettings**(`version`): `Promise`\<`undefined` \| [`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

Fetches the indexed settings for a protocol version. Kept separate from
[getProtocolParamsWithScripts](QueryProviderSundaeSwap.md#getprotocolparamswithscripts) because the `settings` field is newer
than some deployed API environments — a version whose API doesn't serve it
yet returns `undefined` rather than failing the whole protocol fetch.

#### Parameters

• **version**: [`EContractVersion`](../enumerations/EContractVersion.md)

The protocol version to fetch settings for.

#### Returns

`Promise`\<`undefined` \| [`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:778](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L778)
