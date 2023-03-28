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

### buildAtomicZapTx

▸ `Abstract` **buildAtomicZapTx**(`args`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

The main function to build an atomic zap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IZapArgs`](../interfaces/Core.IZapArgs.md) | The built ZapArguments from a [ZapConfig](Core.ZapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L87)

___

### buildCancelTx

▸ `Abstract` **buildCancelTx**(`args`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

The main function to build a cancellation Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`CancelConfigArgs`](../interfaces/Core.CancelConfigArgs.md) | The built CancelArguments from a [CancelConfig](Core.CancelConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L73)

___

### buildChainedZapTx

▸ `Abstract` **buildChainedZapTx**(`args`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

The currently functioning way to process a chained Zap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IZapArgs`](../interfaces/Core.IZapArgs.md) | The built ZapArguments from a [ZapConfig](Core.ZapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L80)

___

### buildDepositTx

▸ `Abstract` **buildDepositTx**(`args`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

The main function to build a deposit Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`DepositConfigArgs`](../interfaces/Core.DepositConfigArgs.md) | The built DepositArguments from a [DepositConfig](Core.DepositConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:59](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L59)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`args`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md) | The built SwapArguments from a [SwapConfig](Core.SwapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L52)

___

### buildWithdrawTx

▸ `Abstract` **buildWithdrawTx**(`args`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

The main function to build a withdraw Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md) | The built WithdrawArguments from a [WithdrawConfig](Core.WithdrawConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L66)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L93)

___

### newTxInstance

▸ `Abstract` **newTxInstance**(): `Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

Should create a new [Transaction](Core.Transaction.md) instance from the supplied transaction library.

#### Returns

`Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L44)
