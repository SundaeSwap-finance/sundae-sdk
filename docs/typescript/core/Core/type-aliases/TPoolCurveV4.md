[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TPoolCurveV4

> **TPoolCurveV4**: `object` \| `object`

The curve (pool kind) for [TxBuilderV4.mintPool](../classes/TxBuilderV4.md#mintpool). A discriminated union
so new curves slot in without changing the call shape. Only `constantSum` is
wired today; `constantProduct`/`concentratedLiquidity` are reserved.

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:230](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L230)
