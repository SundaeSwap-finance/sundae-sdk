# Class: QueryProvider

[Core](../modules/Core.md).QueryProvider

The base Provider interface by which you can implement custom Provider classes.

## Implemented by

- [`QueryProviderSundaeSwap`](Core.QueryProviderSundaeSwap.md)
- [`QueryProviderSundaeSwapLegacy`](Core.QueryProviderSundaeSwapLegacy.md)

## Properties

### findOpenOrderDatum

• `Abstract` **findOpenOrderDatum**: (`utxo`: [`TUTXO`](../modules/Core.md#tutxo)) => `Promise`\<\{ `datum`: `string` ; `datumHash`: `string`  }\>

Finds the associated UTXO data of an open order.

**`Param`**

The transaction hash and index of the open order in the escrow contract.

#### Type declaration

▸ (`utxo`): `Promise`\<\{ `datum`: `string` ; `datumHash`: `string`  }\>

Finds the associated UTXO data of an open order.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utxo` | [`TUTXO`](../modules/Core.md#tutxo) | The transaction hash and index of the open order in the escrow contract. |

##### Returns

`Promise`\<\{ `datum`: `string` ; `datumHash`: `string`  }\>

#### Defined in

[packages/core/src/Abstracts/QueryProvider.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/QueryProvider.abstract.class.ts#L26)

___

### findPoolData

• `Abstract` **findPoolData**: (`query`: `any`) => `Promise`\<[`IPoolData`](../interfaces/Core.IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

**`Param`**

The query object as defined by the implementing class.

#### Type declaration

▸ (`query`): `Promise`\<[`IPoolData`](../interfaces/Core.IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `any` | The query object as defined by the implementing class. |

##### Returns

`Promise`\<[`IPoolData`](../interfaces/Core.IPoolData.md)\>

Returns the queried pool's data.

#### Defined in

[packages/core/src/Abstracts/QueryProvider.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/QueryProvider.abstract.class.ts#L19)
