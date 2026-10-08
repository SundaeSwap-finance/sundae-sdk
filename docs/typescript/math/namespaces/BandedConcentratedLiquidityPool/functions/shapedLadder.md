[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: shapedLadder()

> **shapedLadder**(`n`, `lo`, `hi`, `fee`, `opts`): [`TLadder`](../type-aliases/TLadder.md)

A ladder of `n` bands from `lo` to `hi` with a weight shape, optional
constant-sum bins and an optional per-band fee. The edges are
`uniformLadder`'s exactly; only the weights, curves and fees differ.

## Parameters

• **n**: `number`

• **lo**: [`TFrac`](../type-aliases/TFrac.md)

• **hi**: [`TFrac`](../type-aliases/TFrac.md)

• **fee**: [`TFrac`](../type-aliases/TFrac.md)

• **opts** = `{}`

• **opts.centre?**: `number`

• **opts.csBands?**: `number`[]

Zero-based band indices to price as constant-sum bins.

• **opts.feeAt?**

Overrides `fee` per band.

• **opts.peak?**: `bigint`

• **opts.shape?**: [`TWeightShape`](../type-aliases/TWeightShape.md)

• **opts.tail?**: `bigint`

## Returns

[`TLadder`](../type-aliases/TLadder.md)

## Defined in

[BandedConcentratedLiquidityPool.ts:709](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/BandedConcentratedLiquidityPool.ts#L709)
