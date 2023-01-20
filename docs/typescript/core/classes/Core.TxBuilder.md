# Class: TxBuilder<Options, Wallet, Tx\>

[Core](../modules/Core.md).TxBuilder

The main class by which TxBuilder classes are extended.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Options` | `any` | The options that your TxBuilder will take upon instantiating. |
| `Wallet` | `any` | The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class. |
| `Tx` | `any` | The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx. |

## Hierarchy

- **`TxBuilder`**

  ↳ [`TxBuilderLucid`](Extensions.TxBuilderLucid.md)

## Methods

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`args`): `Promise`<[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/Core.IBuildSwapArgs.md) | The built SwapArguments from a [SwapConfig](Core.SwapConfig.md) instance. |

#### Returns

`Promise`<[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L45)

___

### complete

▸ **complete**(): [`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)

Completes the transaction building and includes validation of the arguments.

#### Returns

[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)

#### Defined in

[classes/TxBuilder.abstract.class.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L51)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/TxBuilder.abstract.class.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L64)

___

### newTx

▸ `Protected` `Abstract` **newTx**(): `Promise`<`Tx`\>

Creates a new Tx type instance from the supplied transaction library.

#### Returns

`Promise`<`Tx`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L37)

___

### validateSwapArguments

▸ `Static` **validateSwapArguments**(`args`, `options`): `Promise`<`void`\>

Validates a swap as having valid values. This **does not** ensure
that your datum is well structured, only that your config arguments have valid values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/Core.IBuildSwapArgs.md) |
| `options` | [`ITxBuilderOptions`](../interfaces/Core.ITxBuilderOptions.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L75)
