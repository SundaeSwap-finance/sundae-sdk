[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: uniformLadder()

> **uniformLadder**(`n`, `lo`, `hi`, `fee`, `curves`): [`TLadder`](../type-aliases/TLadder.md)

An equal-weight ladder of `n` bands from `lo` to `hi`, every band a CL
arc at `fee` unless named in `curves`. The edges are built over a common
denominator and reduced: every rational component of a banded config
must stay below 2^64 (spec V9).

## Parameters

• **n**: `number`

• **lo**: [`TFrac`](../type-aliases/TFrac.md)

• **hi**: [`TFrac`](../type-aliases/TFrac.md)

• **fee**: [`TFrac`](../type-aliases/TFrac.md)

• **curves**: (`0` \| `1`)[] = `[]`

## Returns

[`TLadder`](../type-aliases/TLadder.md)

## Defined in

[BandedConcentratedLiquidityPool.ts:630](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L630)
