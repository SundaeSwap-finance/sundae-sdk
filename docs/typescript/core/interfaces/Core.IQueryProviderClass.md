# Interface: IQueryProviderClass

[Core](../modules/Core.md).IQueryProviderClass

The base Provider interface by which you can implement custom Provider classes.

## Implemented by

- [`ProviderSundaeSwap`](../classes/Extensions.ProviderSundaeSwap.md)

## Properties

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

[@types/queryprovider.ts:17](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L17)

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

[@types/queryprovider.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L25)
