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

[classes/Abstracts/TxBuilder.abstract.class.ts:140](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L140)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:116](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L116)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:133](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L133)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L102)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L87)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L95)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:123](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L123)

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

[classes/Abstracts/TxBuilder.abstract.class.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L109)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:146](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L146)

___

### newTxInstance

▸ `Abstract` **newTxInstance**(): `Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

Should create a new [Transaction](Core.Transaction.md) instance from the supplied transaction library.

#### Returns

`Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L51)

___

### calculateReferralFee

▸ `Static` **calculateReferralFee**(`referral`, `suppliedAmount?`): [`ICalculatedReferralFee`](../interfaces/Core.ICalculatedReferralFee.md)

Should calculate the referral fee from a config.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `referral` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) | The referral fee configuration object. |
| `suppliedAmount?` | `AssetAmount`<`IAssetAmountMetadata`\> | The supplied amount of assets if defined. |

#### Returns

[`ICalculatedReferralFee`](../interfaces/Core.ICalculatedReferralFee.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:59](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L59)
