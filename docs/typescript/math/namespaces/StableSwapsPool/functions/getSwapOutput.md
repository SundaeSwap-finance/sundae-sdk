[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapOutput()

> **getSwapOutput**(`outputMetadata`, `input`, `inputReserve`, `outputReserve`, `fee`, `protocolFee`, `laf`, `roundOutputUp`?, `v2Options`?): [`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

Calculates the output amount and all swap parameters for a given input amount in a Stableswaps pool.
This function determines how many output tokens will be received for a given input, accounting for
the Stableswaps curve, LP fees, and protocol fees.

The calculation process:
1. Validates inputs and fees
2. Calculates the current sum invariant (D)
3. Determines the new Y value after adding input to X
4. Calculates raw output and applies fees (LP + protocol)
5. Computes price impact by comparing ideal vs actual execution price

## Parameters

• **outputMetadata**: `IAssetAmountMetadata`

• **input**: `bigint`

The amount of input tokens to swap.

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

• **roundOutputUp?**: `boolean`

Optional flag to round output up instead of down (default: false).

• **v2Options?**: [`IStableswapsV2Options`](../interfaces/IStableswapsV2Options.md)

Optional V2 parameters (feeDenominator, prescale).

## Returns

[`TSwapOutcome`](../type-aliases/TSwapOutcome.md)

The complete swap outcome including output, fees, reserves, and price impact.

## Throws

If input or reserves are not positive.

## Throws

If fee is not in the range [0, 1).

## Throws

If protocol fee is not in the range [0, 1).

## Throws

If combined fee is greater than or equal to 1.

## Defined in

[StableSwapsPool.ts:385](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/StableSwapsPool.ts#L385)
