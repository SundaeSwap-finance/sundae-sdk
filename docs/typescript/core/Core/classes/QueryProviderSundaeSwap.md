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

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:304](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L304)

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

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:197](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L197)

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

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:198](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L198)

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

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:349](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L349)

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

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:413](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L413)
