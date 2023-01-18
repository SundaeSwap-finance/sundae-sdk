# Class: ITxBuilder<Options, Lib, Data, Tx\>

The main class by which TxBuilder classes are extended.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Options` | `any` | The options that your TxBuilder will take upon instantiating. |
| `Lib` | `any` | The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid. |
| `Data` | `any` | The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data. |
| `Tx` | `any` | The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx. |

## Hierarchy

- **`ITxBuilder`**

  ↳ [`TxBuilderLucid`](TxBuilderLucid.md)

## Methods

### asyncGetLib

▸ `Abstract` **asyncGetLib**(): `Promise`<`Lib`\>

Asynchronously loads the Transaction building Library so-as to avoid loading
heavy dependencies in a blocking manner.

#### Returns

`Promise`<`Lib`\>

#### Defined in

[@types/txbuilder.ts:146](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L146)

___

### buildSwapTx

▸ `Abstract` **buildSwapTx**(`args`): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

The main function to build a swap Transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`any`\> | The built SwapArguments from a [SwapConfig](SwapConfig.md) instance. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[@types/txbuilder.ts:154](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L154)

___

### newTx

▸ `Abstract` **newTx**(): `Promise`<`Tx`\>

Creates a new Tx type instance from the supplied transaction library.

#### Returns

`Promise`<`Tx`\>

#### Defined in

[@types/txbuilder.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L139)
