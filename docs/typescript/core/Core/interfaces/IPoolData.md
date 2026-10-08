[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolData

Pool data that is returned from [Core.QueryProvider.findPoolData](../classes/QueryProvider.md#findpooldata).

## Properties

### activeBand?

> `optional` **activeBand**: `number`

For v4 banded pools, the zero-based band holding the current price.

#### Defined in

[packages/core/src/@types/queryprovider.ts:171](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L171)

***

### bandClosing?

> `optional` **bandClosing**: [`bigint`, `bigint`]

For v4 banded pools, the ladder's top sqrt-price edge as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:169](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L169)

***

### bandCounter?

> `optional` **bandCounter**: `bigint`

For v4 banded pools, the ladder counter X: band i's liquidity is
`floor(bands[i].weight · X / bandWeightTotal)`. Seeds the witness search
when quoting; a stale value is recovered from.

#### Defined in

[packages/core/src/@types/queryprovider.ts:177](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L177)

***

### bands?

> `optional` **bands**: [`IPoolBand`](IPoolBand.md)[]

For v4 banded concentrated-liquidity pools, the ladder in ascending price
order. Band i spans sqrt-prices `[bands[i].start, bands[i+1].start)`; the
last band ends at `bandClosing`. Required to compute banded swap output;
empty for every other curve.

#### Defined in

[packages/core/src/@types/queryprovider.ts:167](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L167)

***

### bandWeightTotal?

> `optional` **bandWeightTotal**: `bigint`

For v4 banded pools, the sum of every band's `weight`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:179](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L179)

***

### currentFee

> **currentFee**: `number`

Returns the current pool fee as a float.

#### Defined in

[packages/core/src/@types/queryprovider.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L89)

***

### curve?

> `optional` **curve**: [`EPoolCurve`](../enumerations/EPoolCurve.md)

For v4 pools, the invariant curve module — determines which swap math
applies (constant product / sum / concentrated liquidity / stableswap).
Absent for pre-v4 pools, whose math is fixed by the contract version.

#### Defined in

[packages/core/src/@types/queryprovider.ts:135](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L135)

***

### ident

> **ident**: `string`

The pool identification hash.

#### Defined in

[packages/core/src/@types/queryprovider.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L91)

***

### linearAmplificationFactor?

> `optional` **linearAmplificationFactor**: `bigint`

The stableswap amplification factor `A`, for BOTH the v3 Stableswaps
contract and the v4 stableswap curve. One parameter, one field, both
versions.

It is the raw integer the pool stores, with no precision scale applied.
Each implementation applies its own scaling internally: v3's
`StableSwapsPool` multiplies by its `A_PRECISION`, and the v4 curve uses
the integer as it stands. Verified against live data — `V4StableswapPool.getD`
at this value reproduces the API's own `sumInvariant` exactly for the
preview pool `ac8d4b1b…` (A = 200).

#### Defined in

[packages/core/src/@types/queryprovider.ts:129](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L129)

***

### prices?

> `optional` **prices**: [`bigint`, `bigint`]

For v4 constant-sum pools, the per-asset prices from the pool's constant-sum
config, aligned to `[assetA, assetB]`. Required to compute constant-sum swap
output; ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:141](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L141)

***

### rates?

> `optional` **rates**: [`bigint`, `bigint`]

For v4 stableswap pools (`EPoolCurve.V4Stableswap`), the per-asset integer
rates from the pool's stableswap config, aligned to `[assetA, assetB]`. The
curve balances where `aReserve·rates[0] == bReserve·rates[1]`, so a
6-decimal against 8-decimal pair is `[100, 1]` and a yield-bearing asset
that has accrued 2% against its base is `[1000000, 1020000]`. Required to
compute stableswap swap output; empty for every other curve.

The amplification the curve also needs is `linearAmplificationFactor`
above, which serves v3 and v4 alike. `rates` is the v4-only half.

#### Defined in

[packages/core/src/@types/queryprovider.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L160)

***

### sqrtPrices?

> `optional` **sqrtPrices**: [[`bigint`, `bigint`], [`bigint`, `bigint`]]

For v4 concentrated-liquidity pools, the immutable sqrt-price range bounds
from the pool's CL config as exact rationals `[[aNum, aDen], [bNum, bDen]]`
(lower bound `a` < upper bound `b`). Required to compute CL swap output;
ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:148](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L148)
