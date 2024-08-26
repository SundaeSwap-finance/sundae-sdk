# Class: TxBuilderV3

[Core](../modules/Core.md).TxBuilderV3

The main class by which TxBuilder classes are extended.

**`Template`**

The options that your TxBuilder will take upon instantiating.

**`Template`**

The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.

**`Template`**

The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.

## Hierarchy

- **`TxBuilderV3`**

  ↳ [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

  ↳ [`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

## Methods

### newTxInstance

▸ **newTxInstance**(): `unknown`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`unknown`

#### Defined in

[packages/core/src/Abstracts/TxBuilderV3.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/TxBuilderV3.abstract.class.ts#L25)
