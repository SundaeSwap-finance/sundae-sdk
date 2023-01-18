# Class: TxBuilder<Options, Lib, Data, Tx\>

The main class by which TxBuilder classes are extended.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Options` | `any` | The options that your TxBuilder will take upon instantiating. |
| `Lib` | `any` | The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid. |
| `Data` | `any` | The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data. |
| `Tx` | `any` | The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx. |

## Hierarchy

- **`TxBuilder`**

  ↳ [`TxBuilderLucid`](TxBuilderLucid.md)

## Methods

### asyncGetLib

▸ `Protected` `Abstract` **asyncGetLib**(): `Promise`<`Lib`\>

Asynchronously loads the Transaction building Library so-as to avoid loading
heavy dependencies in a blocking manner.

#### Returns

`Promise`<`Lib`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L51)

___

### buildEscrowAddressDatum

▸ `Protected` `Abstract` **buildEscrowAddressDatum**(`address`): `Promise`<`Data`\>

Should build the datum for an [EscrowAddress](../modules.md#escrowaddress)

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EscrowAddress`](../modules.md#escrowaddress) |

#### Returns

`Promise`<`Data`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:92](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L92)

___

### buildEscrowSwapDatum

▸ `Protected` `Abstract` **buildEscrowSwapDatum**(`suppliedAsset`, `swap`): `Promise`<`Data`\>

Should build the datum for the swap direction of an [EscrowAddress](../modules.md#escrowaddress)

#### Parameters

| Name | Type |
| :------ | :------ |
| `suppliedAsset` | [`AssetAmount`](AssetAmount.md) |
| `swap` | [`Swap`](../modules.md#swap) |

#### Returns

`Promise`<`Data`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:101](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L101)

___

### buildSwapDatum

▸ `Protected` `Abstract` **buildSwapDatum**(`givenAsset`, `assetA`, `assetB`, `minimumReceivable`): `Promise`<`Data`\>

Should build the full datum for a Swap transaction.

#### Parameters

| Name | Type |
| :------ | :------ |
| `givenAsset` | [`IAsset`](../interfaces/IAsset.md) |
| `assetA` | [`IPoolDataAsset`](../interfaces/IPoolDataAsset.md) |
| `assetB` | [`IPoolDataAsset`](../interfaces/IPoolDataAsset.md) |
| `minimumReceivable` | [`AssetAmount`](AssetAmount.md) |

#### Returns

`Promise`<`Data`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:81](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L81)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`args`): `Promise`<[`TxBuilder`](TxBuilder.md)<`any`, `any`, `any`, `any`\>\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`any`\> | The built SwapArguments from a [SwapConfig](SwapConfig.md) instance. |

#### Returns

`Promise`<[`TxBuilder`](TxBuilder.md)<`any`, `any`, `any`, `any`\>\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:59](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L59)

___

### complete

▸ **complete**(): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

Completes the transaction building and includes validation of the arguments.

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:65](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L65)

___

### newTx

▸ `Protected` `Abstract` **newTx**(): `Promise`<`Tx`\>

Creates a new Tx type instance from the supplied transaction library.

#### Returns

`Promise`<`Tx`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L44)

___

### validateSwapArguments

▸ `Static` **validateSwapArguments**(`args`, `options`, `datumHash?`): `Promise`<`void`\>

Validates the [IBuildSwapArgs](../interfaces/IBuildSwapArgs.md) as having valid values. This **does not** ensure
that your datum is well structured, only that your config arguments have valid values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`any`\> |
| `options` | [`ITxBuilderOptions`](../interfaces/ITxBuilderOptions.md) |
| `datumHash?` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/TxBuilder.abstract.class.ts:113](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L113)
