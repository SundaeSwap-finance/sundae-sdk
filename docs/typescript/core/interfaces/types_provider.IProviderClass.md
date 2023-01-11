[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [@types/provider](../modules/types_provider.md) / IProviderClass

# Interface: IProviderClass

[@types/provider](../modules/types_provider.md).IProviderClass

The base Provider interface by which you can implement custom Provider classes.

## Implemented by

- [`ProviderSundaeSwap`](../classes/classes_Providers_Provider_SundaeSwap.ProviderSundaeSwap.md)

## Properties

### findPoolData

• **findPoolData**: (`query`: [`IPoolQuery`](types_provider.IPoolQuery.md)) => `Promise`<[`IPoolData`](types_provider.IPoolData.md)\>

#### Type declaration

▸ (`query`): `Promise`<[`IPoolData`](types_provider.IPoolData.md)\>

Finds a matching pool on the SundaeSwap protocol.

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](types_provider.IPoolQuery.md) |

##### Returns

`Promise`<[`IPoolData`](types_provider.IPoolData.md)\>

#### Defined in

@types/provider.d.ts:19

___

### findPoolIdent

• **findPoolIdent**: (`query`: [`IPoolQuery`](types_provider.IPoolQuery.md)) => `Promise`<`string`\>

#### Type declaration

▸ (`query`): `Promise`<`string`\>

Finds a matching pool on the SundaeSwap protocol and returns only the ident.

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](types_provider.IPoolQuery.md) |

##### Returns

`Promise`<`string`\>

#### Defined in

@types/provider.d.ts:27
