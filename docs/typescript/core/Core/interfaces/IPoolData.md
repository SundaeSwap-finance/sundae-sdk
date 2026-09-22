[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolData

Pool data that is returned from [Core.QueryProvider.findPoolData](../classes/QueryProvider.md#findpooldata).

## Properties

### amplification?

> `optional` **amplification**: `bigint`

For v4 stableswap pools (`EPoolCurve.V4Stableswap`), the `linear_amplification`
(`A`) from the pool's stableswap config, as a raw integer with no precision
scale. A larger `A` holds the price near par across a wider band of reserve
ratios. Required to compute stableswap swap output; ignored by other
curves.

This is NOT `linearAmplificationFactor` above, which belongs to the v3
Stableswaps contract and carries the v3 `A_PRECISION` scale.

#### Defined in

[packages/core/src/@types/queryprovider.ts:148](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L148)

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

[packages/core/src/@types/queryprovider.ts:115](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L115)

***

### ident

> **ident**: `string`

The pool identification hash.

#### Defined in

[packages/core/src/@types/queryprovider.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L91)

***

### linearAmplificationFactor?

> `optional` **linearAmplificationFactor**: `bigint`

For **v3 Stableswaps** pools (`EContractVersion.Stableswaps`), the pool
datum's amplification factor, already scaled by the v3 `A_PRECISION`. It is
not the v4 stableswap curve's amplification — that one is `amplification`
below, and the two scales differ. Do not read one for the other.

#### Defined in

[packages/core/src/@types/queryprovider.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L109)

***

### prices?

> `optional` **prices**: [`bigint`, `bigint`]

For v4 constant-sum pools, the per-asset prices from the pool's constant-sum
config, aligned to `[assetA, assetB]`. Required to compute constant-sum swap
output; ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:121](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L121)

***

### rates?

> `optional` **rates**: [`bigint`, `bigint`]

For v4 stableswap pools (`EPoolCurve.V4Stableswap`), the per-asset integer
rates from the pool's stableswap config, aligned to `[assetA, assetB]`. The
curve balances where `aReserve·rates[0] == bReserve·rates[1]`, so a
6-decimal against 8-decimal pair is `[100, 1]` and a yield-bearing asset
that has accrued 2% against its base is `[1000000, 1020000]`. Required to
compute stableswap swap output; ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:137](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L137)

***

### sqrtPrices?

> `optional` **sqrtPrices**: [[`bigint`, `bigint`], [`bigint`, `bigint`]]

For v4 concentrated-liquidity pools, the immutable sqrt-price range bounds
from the pool's CL config as exact rationals `[[aNum, aDen], [bNum, bDen]]`
(lower bound `a` < upper bound `b`). Required to compute CL swap output;
ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:128](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L128)
