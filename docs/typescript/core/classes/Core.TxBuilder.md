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

### buildDepositTx

▸ `Abstract` **buildDepositTx**(`args`): `Promise`<[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>\>

The main function to build a deposit Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDepositArgs`](../interfaces/Core.IDepositArgs.md) | The built DepositArguments from a [DepositConfig](Core.DepositConfig.md) instance. |

#### Returns

`Promise`<[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L54)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`args`): `Promise`<[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISwapArgs`](../interfaces/Core.ISwapArgs.md) | The built SwapArguments from a [SwapConfig](Core.SwapConfig.md) instance. |

#### Returns

`Promise`<[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L47)

___

### complete

▸ **complete**(): [`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)

Completes the transaction building and includes validation of the arguments.

#### Returns

[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L60)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L73)

___

### newTx

▸ `Protected` `Abstract` **newTx**(): `Promise`<`Tx`\>

Creates a new Tx type instance from the supplied transaction library.

#### Returns

`Promise`<`Tx`\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L39)

___

### validateSwapArguments

▸ `Static` **validateSwapArguments**(`args`, `options`): `Promise`<`void`\>

Validates a swap as having valid values. This **does not** ensure
that your datum is well structured, only that your config arguments have valid values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ISwapArgs`](../interfaces/Core.ISwapArgs.md) |
| `options` | [`ITxBuilderBaseOptions`](../interfaces/Core.ITxBuilderBaseOptions.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L84)
