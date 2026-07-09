[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Variable: V4\_ORDER\_CONFIG\_LABEL

> `const` **V4\_ORDER\_CONFIG\_LABEL**: `object`

The settings `label` of the OrderConfig entry each order type fulfills. Used
to resolve an order's `config_token` from the protocol query's indexed
settings when the caller doesn't pass one explicitly.

## Type declaration

### basic

> `readonly` **basic**: `"basic-order"` = `"basic-order"`

### swap

> `readonly` **swap**: `"swap-order"` = `"swap-order"`

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:61](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L61)
