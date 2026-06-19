[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: `abstract` TxBuilderAbstractV4

Abstract base for sundae-v4 transaction builders.

Mirrors `TxBuilderAbstractV3`'s surface so callers that dispatch on
contract version can keep their existing pattern (`swap`, `deposit`,
`withdraw`, `cancel`, `mintPool`), but adds one v4-native method —
`basic()` — the v4 placement primitive that backs every order whose
intent isn't strategy. A single basic order can express a swap, a
multi-asset offer, or an LP-side deposit / withdraw depending on the
assets supplied; `swap`, `deposit`, and `withdraw` are convenience
wrappers over it.

## Extended by

- [`TxBuilderV4`](TxBuilderV4.md)

## Methods

### newTxInstance()

> `abstract` **newTxInstance**(): `unknown`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`unknown`

#### Defined in

[packages/core/src/Abstracts/TxBuilderAbstract.V4.class.ts:31](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/TxBuilderAbstract.V4.class.ts#L31)
