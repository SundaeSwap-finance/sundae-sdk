[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IBatchV4Args

Arguments for placing several basic orders in one transaction via
[TxBuilderV4.batch](../classes/TxBuilderV4.md#batch).

## Properties

### orders

> **orders**: [`IBasicV4Args`](IBasicV4Args.md)[]

The orders to place. Each carries its own type, offered assets and
minimums; their `referralFee` fields are ignored in favour of the batch's.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:196](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L196)

***

### referralFee?

> `optional` **referralFee**: [`ITxBuilderReferralFee`](ITxBuilderReferralFee.md)

Taken once for the whole batch, not per order.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:198](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L198)
