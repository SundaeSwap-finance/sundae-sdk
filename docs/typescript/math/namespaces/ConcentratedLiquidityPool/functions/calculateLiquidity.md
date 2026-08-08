[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculateLiquidity()

> **calculateLiquidity**(`a`, `b`, `aReserve`, `bReserve`, `totalLp`): `object`

Deposit LP estimate for a concentrated-liquidity pool. CL deposits reuse the
constant-product *proportional* pinning: minting by the scarcest offered
asset and ceil-pinning the reserve deltas gives, per asset,
`a1·L0 ≥ a0·L1` and `b1·L0 ≥ b0·L1` — and those two bounds multiply to
exactly the on-chain CL non-swap invariant `va1·vb1·L0² ≥ va0·vb0·L1²`
(`cl_check.ak`). So the proportional deposit is always chain-valid; excess of
either asset is refunded via aChange/bChange. This mirrors the scooper's
`resolve_cl_deposit` (which likewise reuses the CP pinning).

## Parameters

• **a**: `bigint`

• **b**: `bigint`

• **aReserve**: `bigint`

• **bReserve**: `bigint`

• **totalLp**: `bigint`

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

> **generatedLp**: `bigint` = `newLpTokens`

### nextTotalLp

> **nextTotalLp**: `bigint` = `newTotalLpTokens`

### shareAfterDeposit

> **shareAfterDeposit**: `Fraction`

## Defined in

[ConcentratedLiquidityPool.ts:269](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConcentratedLiquidityPool.ts#L269)
