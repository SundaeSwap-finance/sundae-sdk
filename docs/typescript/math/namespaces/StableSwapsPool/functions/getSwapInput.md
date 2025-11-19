[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapInput()

> **getSwapInput**(`outputMetadata`, `output`, `inputReserve`, `outputReserve`, `fee`, `protocolFee`, `laf`): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculates the required input amount and all swap parameters for a desired output amount in a Stableswaps pool.
This is the reverse operation of getSwapOutput - given how much you want to receive, it determines
how much you need to provide as input, accounting for fees and the Stableswaps curve.

The calculation process:
1. Validates inputs, fees, and output constraints
2. Calculates raw output needed before fees
3. Determines the new X value to achieve the desired Y reduction
4. Calculates required input and separates LP and protocol fees
5. Computes price impact by comparing ideal vs actual execution price

## Parameters

• **outputMetadata**: `IAssetAmountMetadata`

• **output**: `bigint`

The desired amount of output tokens to receive.

• **inputReserve**: `bigint`

The current reserve amount of the input token in the pool.

• **outputReserve**: `bigint`

The current reserve amount of the output token in the pool.

• **fee**: `TFractionLike`

The liquidity provider fee as a fraction (e.g., 0.003 for 0.3%).

• **protocolFee**: `TFractionLike`

The protocol fee as a fraction.

• **laf**: `bigint`

The linear amplification factor of the pool.

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The complete swap outcome including required input, fees, reserves, and price impact.

## Throws

If output or reserves are not positive.

## Throws

If output is greater than or equal to the output reserve.

## Throws

If fee is not in the range [0, 1).

## Throws

If protocol fee is not in the range [0, 1).

## Throws

If combined fee is greater than or equal to 1.

## Defined in

[StableSwapsPool.ts:454](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L454)
