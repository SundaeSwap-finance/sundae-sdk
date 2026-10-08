[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TBand

> **TBand**: `object`

One band of the ladder.

## Type declaration

### curve

> **curve**: `0` \| `1`

0 = concentrated-liquidity arc, 1 = constant-sum bin.

### feeBuy

> **feeBuy**: [`TFrac`](TFrac.md)

Fee on swaps that buy the pool's first asset (B in).

### feeSell

> **feeSell**: [`TFrac`](TFrac.md)

Fee on swaps that sell the pool's first asset (A in).

### start

> **start**: [`TFrac`](TFrac.md)

The band's LOWER sqrt-price edge. The next band's `start` is its upper edge.

### weight

> **weight**: `bigint`

The band's share of the ladder's liquidity counter.

## Defined in

[BandedConcentratedLiquidityPool.ts:34](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L34)
