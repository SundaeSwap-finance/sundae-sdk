[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculateLiquidity()

> **calculateLiquidity**(`a`, `b`, `aReserve`, `bReserve`, `totalLp`, `priceA`, `priceB`): `object`

Calculate the Add (Mixed-Deposit) Liquidity parameters for a constant-sum
pool. Deposits are valued at the pool's fixed per-asset prices, so any mix
of the two assets is accepted with no refunds — matching the v4 contract's
`compute_deposit_n`:

  generatedLp = (a·priceA + b·priceB) · totalLp / (aReserve·priceA + bReserve·priceB)

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

> **actualDepositedA**: `bigint` = `a`

### actualDepositedB

> **actualDepositedB**: `bigint` = `b`

### bChange

> **bChange**: `bigint`

### generatedLp

> **generatedLp**: `bigint` = `newLpTokens`

### nextTotalLp

> **nextTotalLp**: `bigint` = `newTotalLpTokens`

### shareAfterDeposit

> **shareAfterDeposit**: `Fraction`

## Throws

If the pool has no value or minted lp.

## Throws

If both deposit amounts are zero, or either is negative.

## Throws

If either price is non-positive.

## Defined in

[ConstantSumPool.ts:197](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L197)
