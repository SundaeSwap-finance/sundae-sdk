[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapOutput()

> **getSwapOutput**(`input`, `inputReserve`, `outputReserve`, `fee`, `roundOutputUp`?): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate swap outcome for a given input and pool parameters (input tokens, output tokens, fee).
Throws if
 - any of the arguments are negative
 - fee is greater than or equal 1

## Parameters

• **input**: `bigint`

The given amount of tokens to be swapped

• **inputReserve**: `bigint`

The amount of tokens in the input reserve

• **outputReserve**: `bigint`

The amount of tokens in the output reserve

• **fee**: `TFractionLike`

The liquidity provider fee

• **roundOutputUp?**: `boolean`

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details

## Defined in

[ConstantProductPool.ts:159](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantProductPool.ts#L159)
