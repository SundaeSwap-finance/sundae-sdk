[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [@types/txbuilder](../modules/types_txbuilder.md) / ITxBuilderClass

# Interface: ITxBuilderClass<Options, Lib, Data, Tx\>

[@types/txbuilder](../modules/types_txbuilder.md).ITxBuilderClass

The main interface by which TxBuilder classes are implemented.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Options` | `Object` | The options that your TxBuilder will take upon instantiating. |
| `Lib` | `unknown` | The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid. |
| `Data` | `unknown` | The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data. |
| `Tx` | `unknown` | The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx. |

## Implemented by

- [`TxBuilderLucid`](../classes/classes_TxBuilders_TxBuilder_Lucid_class.TxBuilderLucid.md)

## Properties

### buildSwap

• **buildSwap**: (`args`: `IBuildSwapArgs`) => `Promise`<[`TTxBuilderComplete`](../modules/types_txbuilder.md#ttxbuildercomplete)\>

#### Type declaration

▸ (`args`): `Promise`<[`TTxBuilderComplete`](../modules/types_txbuilder.md#ttxbuildercomplete)\>

The main function to build a swap Transaction.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `IBuildSwapArgs` | The built SwapArguments from a SwapConfig instance. |

##### Returns

`Promise`<[`TTxBuilderComplete`](../modules/types_txbuilder.md#ttxbuildercomplete)\>

#### Defined in

@types/txbuilder.d.ts:59
