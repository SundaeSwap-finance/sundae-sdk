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

▸ `Abstract` **buildAtomicZapTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to build an atomic zap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`ZapConfig`](Core.ZapConfig.md) | A [ZapConfig](Core.ZapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:108](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L108)

___

### buildCancelTx

▸ `Abstract` **buildCancelTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to build a cancellation Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`CancelConfig`](Core.CancelConfig.md) | A [CancelConfig](Core.CancelConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L84)

___

### buildChainedZapTx

▸ `Abstract` **buildChainedZapTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The currently functioning way to process a chained Zap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`ZapConfig`](Core.ZapConfig.md) | A [ZapConfig](Core.ZapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:101](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L101)

___

### buildDepositTx

▸ `Abstract` **buildDepositTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to build a deposit Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`DepositConfig`](Core.DepositConfig.md) | A [DepositConfig](Core.DepositConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:70](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L70)

___

### buildFreezerTx

▸ `Abstract` **buildFreezerTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to build a freezer Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FreezerConfig`](Core.FreezerConfig.md) | A [FreezerConfig](Core.FreezerConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L55)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`SwapConfig`](Core.SwapConfig.md) | A [SwapConfig](Core.SwapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:63](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L63)

___

### buildUpdateSwapTx

▸ `Abstract` **buildUpdateSwapTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to update an open swap.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `Object` | An object of both a [CancelConfig](Core.CancelConfig.md) and [SwapConfig](Core.SwapConfig.md) instance. |
| `config.cancelConfig` | [`CancelConfig`](Core.CancelConfig.md) | - |
| `config.swapConfig` | [`SwapConfig`](Core.SwapConfig.md) | - |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L91)

___

### buildWithdrawTx

▸ `Abstract` **buildWithdrawTx**(`config`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

The main function to build a withdraw Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`WithdrawConfig`](Core.WithdrawConfig.md) | A [WithdrawConfig](Core.WithdrawConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L77)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:114](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L114)

___

### newTxInstance

▸ `Abstract` **newTxInstance**(): `Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

Should create a new [Transaction](Core.Transaction.md) instance from the supplied transaction library.

#### Returns

`Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L47)
