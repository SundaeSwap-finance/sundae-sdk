[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: QueryProviderSundaeSwapLegacy

This class provides a simple set of useful tooling, but primarily is used to
query data about pools on the SundaeSwap protocol.

## Example

```ts
const query = new QueryProviderSundaeSwapLegacy("preview");
const { ident } = await query.findPoolData({
  pair: [assetAId, assetBId],
  fee: "0.03"
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

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:153](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L153)

***

### findPoolData()

> **findPoolData**(`query`): `Promise`\<[`IPoolData`](../interfaces/IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

#### Parameters

• **query**: [`IPoolQueryLegacy`](../interfaces/IPoolQueryLegacy.md)

The query object as defined by the implementing class.

#### Returns

`Promise`\<[`IPoolData`](../interfaces/IPoolData.md)\>

Returns the queried pool's data.

#### Implementation of

[`QueryProvider`](QueryProvider.md).[`findPoolData`](QueryProvider.md#findpooldata)

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts:72](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwapLegacy.ts#L72)
