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

▸ `Abstract` **buildAtomicZapTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to build an atomic zap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`ZapConfig`](Core.ZapConfig.md) | A [ZapConfig](Core.ZapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L107)

___

### buildCancelTx

▸ `Abstract` **buildCancelTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to build a cancellation Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`CancelConfig`](Core.CancelConfig.md) | A [CancelConfig](Core.CancelConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:83](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L83)

___

### buildChainedZapTx

▸ `Abstract` **buildChainedZapTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The currently functioning way to process a chained Zap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`ZapConfig`](Core.ZapConfig.md) | A [ZapConfig](Core.ZapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L100)

___

### buildDepositTx

▸ `Abstract` **buildDepositTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to build a deposit Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`DepositConfig`](Core.DepositConfig.md) | A [DepositConfig](Core.DepositConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L69)

___

### buildFreezerTx

▸ `Abstract` **buildFreezerTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to build a freezer Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FreezerConfig`](Core.FreezerConfig.md) | A [FreezerConfig](Core.FreezerConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L54)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`SwapConfig`](Core.SwapConfig.md) | A [SwapConfig](Core.SwapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L62)

___

### buildUpdateSwapTx

▸ `Abstract` **buildUpdateSwapTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to update an open swap.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `Object` | An object of both a [CancelConfig](Core.CancelConfig.md) and [SwapConfig](Core.SwapConfig.md) instance. |
| `config.cancelConfig` | [`CancelConfig`](Core.CancelConfig.md) | - |
| `config.swapConfig` | [`SwapConfig`](Core.SwapConfig.md) | - |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:90](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L90)

___

### buildWithdrawTx

▸ `Abstract` **buildWithdrawTx**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

The main function to build a withdraw Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`WithdrawConfig`](Core.WithdrawConfig.md) | A [WithdrawConfig](Core.WithdrawConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:76](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L76)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:113](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L113)

___

### newTxInstance

▸ `Abstract` **newTxInstance**(): `Promise`<`Tx`\>

Should create a new transaction instance from the supplied transaction library.

#### Returns

`Promise`<`Tx`\>

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L46)
