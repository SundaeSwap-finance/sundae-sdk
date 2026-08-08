[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolData

Pool data that is returned from [Core.QueryProvider.findPoolData](../classes/QueryProvider.md#findpooldata).

## Properties

### currentFee

> **currentFee**: `number`

Returns the current pool fee as a float.

#### Defined in

[packages/core/src/@types/queryprovider.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L89)

***

### curve?

> `optional` **curve**: [`EPoolCurve`](../enumerations/EPoolCurve.md)

For v4 pools, the invariant curve module — determines which swap math
applies (constant product / sum / concentrated liquidity). Absent for
pre-v4 pools, whose math is fixed by the contract version.

#### Defined in

[packages/core/src/@types/queryprovider.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L109)

***

### ident

> **ident**: `string`

The pool identification hash.

#### Defined in

[packages/core/src/@types/queryprovider.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L91)

***

### prices?

> `optional` **prices**: [`bigint`, `bigint`]

For v4 constant-sum pools, the per-asset prices from the pool's constant-sum
config, aligned to `[assetA, assetB]`. Required to compute constant-sum swap
output; ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:115](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L115)

***

### sqrtPrices?

> `optional` **sqrtPrices**: [[`bigint`, `bigint`], [`bigint`, `bigint`]]

For v4 concentrated-liquidity pools, the immutable sqrt-price range bounds
from the pool's CL config as exact rationals `[[aNum, aDen], [bNum, bDen]]`
(lower bound `a` < upper bound `b`). Required to compute CL swap output;
ignored by other curves.

#### Defined in

[packages/core/src/@types/queryprovider.ts:122](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L122)
