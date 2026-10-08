[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TIndexedLadder

> **TIndexedLadder**: [`TLadder`](TLadder.md) & `object`

A ladder with its index built once. Every probe of the witness search
reads the index for every band, and rebuilding it per probe is most of
the cost of a quote.

## Type declaration

### index

> **index**: [`TIndexEntry`](TIndexEntry.md)[]

## Defined in

[BandedConcentratedLiquidityPool.ts:145](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L145)
