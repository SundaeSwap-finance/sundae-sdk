[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculateLiquidity()

> **calculateLiquidity**(`a`, `b`, `aReserve`, `bReserve`, `totalLp`, `priceA`, `priceB`): `object`

Calculate the deposit parameters for a 2-asset constant-sum pool via the
TARGET-PINNED rule the deployed validator enforces (see
[calculatePinnedDeposit](calculatePinnedDeposit.md)): the mint is capped by the scarcest offered
asset, both assets must be offered, and anything above the pinned deltas is
refunded via aChange/bChange.

## Parameters

• **a**: `bigint`

The amount of token A to deposit.

• **b**: `bigint`

The amount of token B to deposit.

• **aReserve**: `bigint`

The current reserve of token A in the pool.

• **bReserve**: `bigint`

The current reserve of token B in the pool.

• **totalLp**: `bigint`

The total lp tokens for the pool before the deposit.

• **priceA**: `bigint`

The pool's price for token A (from the constant-sum config).

• **priceB**: `bigint`

The pool's price for token B.

## Returns

`object`

### aChange

> **aChange**: `bigint`

### actualDepositedA

> **actualDepositedA**: `bigint`

### actualDepositedB

> **actualDepositedB**: `bigint`

### bChange

> **bChange**: `bigint`

### generatedLp

> **generatedLp**: `bigint`

### nextTotalLp

> **nextTotalLp**: `bigint`

### shareAfterDeposit

> **shareAfterDeposit**: `Fraction`

## Throws

If the pool has no value or minted lp.

## Throws

If both deposit amounts are zero, or either is negative.

## Throws

If either price is non-positive.

## Defined in

[ConstantSumPool.ts:196](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L196)
