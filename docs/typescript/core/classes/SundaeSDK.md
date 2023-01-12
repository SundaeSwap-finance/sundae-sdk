# Class: SundaeSDK

A description for the SundaeSDK class.

```ts
const sdk = new SundaeSDK(
 new ProviderSundaeSwap()
);
```

## Constructors

### constructor

• **new SundaeSDK**(`builder`)

You'll need to provide a TxBuilder class to the main SDK, which is used to build Transactions and submit them.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `builder` | [`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<`any`, `any`, `any`, `any`\> | An instance of TxBuilder. |

#### Defined in

[classes/SundaeSDK.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L19)

## Properties

### builder

• `Private` **builder**: [`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<`any`, `any`, `any`, `any`\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L19)

## Methods

### build

▸ **build**(): [`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<`any`, `any`, `any`, `any`\>

Utility method to retrieve the builder instance.

#### Returns

[`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<`any`, `any`, `any`, `any`\>

#### Defined in

[classes/SundaeSDK.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L28)

___

### query

▸ **query**(): [`IProviderClass`](../interfaces/IProviderClass.md)

Utility method to retrieve the provider instance.

#### Returns

[`IProviderClass`](../interfaces/IProviderClass.md)

#### Defined in

[classes/SundaeSDK.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L37)

___

### swap

▸ **swap**(`swapConfig`): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

Easy abstraction for building a swap when you don't know the pool data.
Calls [buildSwap](../interfaces/ITxBuilderClass.md#buildswap) under the hood after querying a
matching pool.

#### Parameters

| Name | Type |
| :------ | :------ |
| `swapConfig` | [`SwapConfig`](SwapConfig.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:49](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L49)
