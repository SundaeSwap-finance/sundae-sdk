[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getTokensForLp()

> **getTokensForLp**(`lp`, `aReserve`, `bReserve`, `totalLp`): [`TPair`](../../SharedPoolMath/type-aliases/TPair.md)

Get the token amounts the given lp represents

## Parameters

• **lp**: `bigint`

the lp amount

• **aReserve**: `bigint`

the pool's reserveA amount

• **bReserve**: `bigint`

the pool's reserveB amount

• **totalLp**: `bigint`

the pool's total minted lp currently

## Returns

[`TPair`](../../SharedPoolMath/type-aliases/TPair.md)

[a, b] token amounts

## Defined in

[ConstantProductPool.ts:125](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantProductPool.ts#L125)
