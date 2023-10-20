# Interface: IQueryProviderClass

[Core](../modules/Core.md).IQueryProviderClass

The base Provider interface by which you can implement custom Provider classes.

## Implemented by

- [`ProviderSundaeSwap`](../classes/Extensions.ProviderSundaeSwap.md)

## Properties

### findOpenOrderDatum

• **findOpenOrderDatum**: (`utxo`: [`UTXO`](../modules/Core.md#utxo)) => `Promise`<{ `datum`: `string` ; `datumHash`: `string`  }\>

#### Type declaration

▸ (`utxo`): `Promise`<{ `datum`: `string` ; `datumHash`: `string`  }\>

Finds the associated UTXO data of an open order.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utxo` | [`UTXO`](../modules/Core.md#utxo) | The transaction hash and index of the open order in the escrow contract. |

##### Returns

`Promise`<{ `datum`: `string` ; `datumHash`: `string`  }\>

#### Defined in

[@types/queryprovider.ts:53](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L53)

___

### findPoolData

• **findPoolData**: (`query`: [`IPoolQuery`](Core.IPoolQuery.md)) => `Promise`<[`IPoolData`](Core.IPoolData.md)\>

#### Type declaration

▸ (`query`): `Promise`<[`IPoolData`](Core.IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](Core.IPoolQuery.md) |

##### Returns

`Promise`<[`IPoolData`](Core.IPoolData.md)\>

Returns the queried pool's data.

#### Defined in

[@types/queryprovider.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L28)

___

### findPoolIdent

• **findPoolIdent**: (`query`: [`IPoolQuery`](Core.IPoolQuery.md)) => `Promise`<`string`\>

#### Type declaration

▸ (`query`): `Promise`<`string`\>

Finds a matching pool on the SundaeSwap protocol and returns only the ident.

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](Core.IPoolQuery.md) |

##### Returns

`Promise`<`string`\>

Returns queried pool's ident.

#### Defined in

[@types/queryprovider.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L37)

___

### getAllPools

• **getAllPools**: (`type?`: [`EPoolSearchType`](../enums/Core.EPoolSearchType.md), `query?`: `string`) => `Promise`<[`IPoolData`](Core.IPoolData.md)[]\>

#### Type declaration

▸ (`type?`, `query?`): `Promise`<[`IPoolData`](Core.IPoolData.md)[]\>

Retrieves all available pools' data.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type?` | [`EPoolSearchType`](../enums/Core.EPoolSearchType.md) | The type of search to perform. |
| `query?` | `string` | A string to use as your query. |

##### Returns

`Promise`<[`IPoolData`](Core.IPoolData.md)[]\>

Returns an array of IPoolData objects, each representing the data for an individual pool.

#### Defined in

[@types/queryprovider.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L46)
