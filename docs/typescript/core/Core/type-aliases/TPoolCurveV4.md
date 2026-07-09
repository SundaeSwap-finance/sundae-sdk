[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TPoolCurveV4

> **TPoolCurveV4**: `object`

The curve (pool kind) for [TxBuilderV4.mintPool](../classes/TxBuilderV4.md#mintpool). A discriminated union
so new curves slot in without changing the call shape. Only `constantSum` is
wired today; `constantProduct`/`concentratedLiquidity` are reserved.

## Type declaration

### bountyK?

> `optional` **bountyK**: [`IFractionV4`](../interfaces/IFractionV4.md)

Rebalance-bounty rate; defaults to `fee / 2`. Pass `{num:0n,den:1n}` to disable.

### fee

> **fee**: [`IFractionV4`](../interfaces/IFractionV4.md)

The pool's swap fee.

### kind

> **kind**: `"constantSum"`

### prices?

> `optional` **prices**: `bigint`[]

Per-asset price weights (defaults to all `1n`, i.e. equal-valued assets).

### waiveFeeOnClaim?

> `optional` **waiveFeeOnClaim**: `boolean`

Whether tag-5 claim steps waive the LP fee on the embedded swap.

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:183](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L183)
