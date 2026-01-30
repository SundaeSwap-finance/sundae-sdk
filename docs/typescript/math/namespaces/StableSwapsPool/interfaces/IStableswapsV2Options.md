[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Interface: IStableswapsV2Options

Optional parameters for V2 Stableswaps pools.

## Properties

### feeDenominator?

> `optional` **feeDenominator**: `bigint`

Fee precision denominator. Defaults to FEE_PRECISION (10,000n for basis points).
V2 pools can use higher values for finer fee precision.

#### Defined in

[StableSwapsPool.ts:349](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L349)

***

### prescale?

> `optional` **prescale**: [`bigint`, `bigint`]

Prescale factors [prescaleA, prescaleB] for normalizing tokens with different decimals.
Reserves are multiplied by these factors before invariant calculations.
Defaults to [1n, 1n] (no scaling).

#### Defined in

[StableSwapsPool.ts:356](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L356)
