[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TUpdateV4Order

> **TUpdateV4Order**: `object` & [`ISwapV4Args`](../interfaces/ISwapV4Args.md) \| `object` & [`IBasicV4Args`](../interfaces/IBasicV4Args.md)

The replacement order for an [TxBuilderV4.update](../classes/TxBuilderV4.md#update) — a fresh swap or
basic order placed in the same transaction that cancels the old one. The
`kind` discriminator selects which constraint set the new order carries.

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:135](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L135)
