[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculateLiquidity()

> **calculateLiquidity**(`a`, `b`, `aReserve`, `bReserve`, `totalLp`, `rateA`, `rateB`, `amp`): `object`

Calculate the deposit parameters for a two-asset v4 stableswap pool through
the target-pinned rule (see [calculatePinnedDeposit](calculatePinnedDeposit.md)). Surplus above
the pinned deltas comes back as `aChange` / `bChange`, the way the scoop
refunds it on-chain.

## Parameters

• **a**: `bigint`

The amount of token A to deposit.

• **b**: `bigint`

The amount of token B to deposit.

• **aReserve**: `bigint`

The pool's reserve of token A.

• **bReserve**: `bigint`

The pool's reserve of token B.

• **totalLp**: `bigint`

The pool's total LP supply before the deposit.

• **rateA**: `bigint`

The pool's rate for token A (from the stableswap config).

• **rateB**: `bigint`

The pool's rate for token B.

• **amp**: `bigint`

The pool's `linear_amplification` (`A`), the raw stored integer.

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

## Defined in

[V4StableswapPool.ts:588](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/V4StableswapPool.ts#L588)
