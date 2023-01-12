# Interface: IProviderClass

The base Provider interface by which you can implement custom Provider classes.

## Implemented by

- [`ProviderSundaeSwap`](../classes/ProviderSundaeSwap.md)

## Properties

### findPoolData

• **findPoolData**: (`query`: [`IPoolQuery`](IPoolQuery.md)) => `Promise`<[`IPoolData`](IPoolData.md)\>

#### Type declaration

▸ (`query`): `Promise`<[`IPoolData`](IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](IPoolQuery.md) |

##### Returns

`Promise`<[`IPoolData`](IPoolData.md)\>

#### Defined in

[@types/provider.ts:17](https://github.com/SundaeSwap-finance/sundae-sdk/blob/f054aa7/packages/core/src/@types/provider.ts#L17)

___

### findPoolIdent

• **findPoolIdent**: (`query`: [`IPoolQuery`](IPoolQuery.md)) => `Promise`<`string`\>

#### Type declaration

▸ (`query`): `Promise`<`string`\>

Finds a matching pool on the SundaeSwap protocol and returns only the ident.

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](IPoolQuery.md) |

##### Returns

`Promise`<`string`\>

#### Defined in

[@types/provider.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/f054aa7/packages/core/src/@types/provider.ts#L25)
