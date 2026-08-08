[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TUpdateV4Order

> **TUpdateV4Order**: `object` & [`IBasicV4Args`](../interfaces/IBasicV4Args.md)

The order shapes an update may produce. No `swap` member: an update cancels
and re-places, so replacing a route order is placing one, and that is outside
the audited surface (see [TxBuilderV4.swap](../classes/TxBuilderV4.md#swap)). An existing route order
can still be cancelled.

## Type declaration

### kind

> **kind**: `"basic"`

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:185](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L185)
