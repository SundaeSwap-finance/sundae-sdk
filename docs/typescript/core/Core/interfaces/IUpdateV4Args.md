[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IUpdateV4Args

Arguments for updating a v4 order via [TxBuilderV4.update](../classes/TxBuilderV4.md#update).

## Properties

### cancelUtxo

> **cancelUtxo**: [`TUTXO`](../type-aliases/TUTXO.md)

The order UTxO being replaced — spent via the order validator's Cancel path.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:127](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L127)

***

### order

> **order**: [`TUpdateV4Order`](../type-aliases/TUpdateV4Order.md)

The replacement order (swap or basic) locked in the same transaction.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:129](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L129)
