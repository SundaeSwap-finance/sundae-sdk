# Class: TxBuilder

[Core](../modules/Core.md).TxBuilder

The main class by which TxBuilder classes are extended.

**`Template`**

The options that your TxBuilder will take upon instantiating.

**`Template`**

The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.

**`Template`**

The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.

## Hierarchy

- **`TxBuilder`**

  ↳ [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

  ↳ [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

## Methods

### newTxInstance

▸ **newTxInstance**(): `unknown`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`unknown`

#### Defined in

[packages/core/src/Abstracts/TxBuilder.abstract.class.ts:22](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/TxBuilder.abstract.class.ts#L22)
