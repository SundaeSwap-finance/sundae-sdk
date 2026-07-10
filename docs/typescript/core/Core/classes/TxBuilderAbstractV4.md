[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: `abstract` TxBuilderAbstractV4

Abstract base for sundae-v4 transaction builders.

Mirrors `TxBuilderAbstractV3`'s surface so callers that dispatch on
contract version can keep their existing pattern (`swap`, `deposit`,
`withdraw`, `cancel`, `mintPool`), but adds v4-native methods — `basic()`
and `strategy()`. `swap()` carries the swap-order constraint set, and
`strategy()` the strategy-order set; `basic()` is the shared primitive for
`deposit` / `withdraw` / `claim` orders (constructor-tagged `BasicFields`),
of which `deposit` and `withdraw` are convenience wrappers.

## Extended by

- [`TxBuilderV4`](TxBuilderV4.md)

## Methods

### newTxInstance()

> `abstract` **newTxInstance**(): `unknown`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`unknown`

#### Defined in

[packages/core/src/Abstracts/TxBuilderAbstract.V4.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/TxBuilderAbstract.V4.class.ts#L30)
