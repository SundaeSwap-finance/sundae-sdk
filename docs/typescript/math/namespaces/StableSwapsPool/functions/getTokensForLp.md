[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getTokensForLp()

> **getTokensForLp**(`lp`, `aReserve`, `bReserve`, `totalLp`): [`TPair`](../../SharedPoolMath/type-aliases/TPair.md)

Calculates the token amounts that a given LP token amount represents when withdrawing
from a Stableswaps pool. The withdrawal is proportional to the LP tokens being redeemed
relative to the total LP supply.

This uses a simple linear proportion: amount = (lp * reserve) / totalLp for each asset.

## Parameters

• **lp**: `bigint`

The amount of LP tokens being redeemed.

• **aReserve**: `bigint`

The pool's current reserve amount of token A.

• **bReserve**: `bigint`

The pool's current reserve amount of token B.

• **totalLp**: `bigint`

The pool's total minted LP tokens currently in circulation.

## Returns

[`TPair`](../../SharedPoolMath/type-aliases/TPair.md)

A tuple [a, b] containing the amounts of tokens A and B to withdraw.

## Defined in

[StableSwapsPool.ts:307](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L307)
