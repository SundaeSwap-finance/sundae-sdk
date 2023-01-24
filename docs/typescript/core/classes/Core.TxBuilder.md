# Class: TxBuilder<Options, Wallet, Tx, QueryProvider\>

[Core](../modules/Core.md).TxBuilder

The main class by which TxBuilder classes are extended.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Options` | `any` | The options that your TxBuilder will take upon instantiating. |
| `Wallet` | `any` | The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class. |
| `Tx` | `any` | The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx. |
| `QueryProvider` | [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md) | - |

## Hierarchy

- **`TxBuilder`**

  ↳ [`TxBuilderLucid`](Extensions.TxBuilderLucid.md)

## Methods

### buildDepositTx

▸ `Abstract` **buildDepositTx**(`args`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

The main function to build a deposit Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDepositArgs`](../interfaces/Core.IDepositArgs.md) | The built DepositArguments from a [DepositConfig](Core.DepositConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L57)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`args`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISwapArgs`](../interfaces/Core.ISwapArgs.md) | The built SwapArguments from a [SwapConfig](Core.SwapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L50)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:63](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L63)

___

### newTxInstance

▸ `Protected` `Abstract` **newTxInstance**(): `Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

Should create a new [Transaction](Core.Transaction.md) instance from the supplied transaction library.

#### Returns

`Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L42)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L74)