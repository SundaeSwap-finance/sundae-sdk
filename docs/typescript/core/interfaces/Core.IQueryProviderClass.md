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

[@types/queryprovider.ts:34](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L34)

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

#### Defined in

[@types/queryprovider.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L19)

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

#### Defined in

[@types/queryprovider.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L27)
