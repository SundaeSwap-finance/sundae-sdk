[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapInput()

> **getSwapInput**(`output`, `inputReserve`, `outputReserve`, `fee`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculate input required for a swap outcome for a given output and pool parameters (input tokens, output tokens, fee).
Throws if
 - any of the arguments are negative
 - fee is greater than or equal 1
 - output is greater than or equal to output reserve

## Parameters

• **output**: `bigint`

• **inputReserve**: `bigint`

• **outputReserve**: `bigint`

• **fee**: `TFractionLike`

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The swap details

## Defined in

[ConstantProductPool.ts:258](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantProductPool.ts#L258)
