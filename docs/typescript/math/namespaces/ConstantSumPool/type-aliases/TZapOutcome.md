[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Type Alias: TZapOutcome

> **TZapOutcome**: `object`

Outcome of [calculateZap](../functions/calculateZap.md). Every array is aligned to `offered`.

## Type declaration

### change

> **change**: `bigint`[]

`depositBasket − deltas`: surplus returned to the user.

### deltas

> **deltas**: `bigint`[]

Per-asset ceil-pinned deposit.

### depositBasket

> **depositBasket**: `bigint`[]

`offered` after the swap: what is actually deposited.

### generatedLp

> **generatedLp**: `bigint`

### nextReserves

> **nextReserves**: `bigint`[]

Reserves after the swap — what the deposit pins against.

### nextTotalLp

> **nextTotalLp**: `bigint`

### shareAfterDeposit

> **shareAfterDeposit**: `Fraction`

### swapIndex

> **swapIndex**: `number` \| `undefined`

Index of the offered asset swapped away; `undefined` when the basket already matches the reserves.

### swapInput

> **swapInput**: `bigint`

Amount of `offered[swapIndex]` swapped away.

### swapOutput

> **swapOutput**: `bigint`

Amount of the other asset the swap yields.

### targetDeltaV

> **targetDeltaV**: `bigint`

## Defined in

[ConstantSumPool.ts:376](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L376)
