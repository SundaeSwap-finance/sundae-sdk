[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: `abstract` TxBuilderAbstractV1

The main class by which TxBuilder classes are extended.

## Template

The options that your TxBuilder will take upon instantiating.

## Template

The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.

## Template

The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.

## Extended by

- [`TxBuilderV1`](TxBuilderV1.md)

## Methods

### newTxInstance()

> `abstract` **newTxInstance**(): `unknown`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`unknown`

#### Defined in

[packages/core/src/Abstracts/TxBuilderAbstract.V1.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/TxBuilderAbstract.V1.class.ts#L25)
