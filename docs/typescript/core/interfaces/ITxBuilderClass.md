# Interface: ITxBuilderClass<Options, Lib, Data, Tx\>

The main interface by which TxBuilder classes are implemented.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Options` | `Object` | The options that your TxBuilder will take upon instantiating. |
| `Lib` | `unknown` | The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid. |
| `Data` | `unknown` | The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data. |
| `Tx` | `unknown` | The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx. |

## Implemented by

- [`TxBuilderLucid`](../classes/TxBuilderLucid.md)

## Properties

### buildSwap

• **buildSwap**: (`args`: [`IBuildSwapArgs`](IBuildSwapArgs.md)) => `Promise`<[`ITxBuilderComplete`](ITxBuilderComplete.md)\>

#### Type declaration

▸ (`args`): `Promise`<[`ITxBuilderComplete`](ITxBuilderComplete.md)\>

The main function to build a swap Transaction.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IBuildSwapArgs`](IBuildSwapArgs.md) | The built SwapArguments from a SwapConfig instance. |

##### Returns

`Promise`<[`ITxBuilderComplete`](ITxBuilderComplete.md)\>

#### Defined in

[@types/txbuilder.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/ef3cd12/packages/core/src/@types/txbuilder.ts#L60)
