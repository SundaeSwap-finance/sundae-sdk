[**@sundaeswap/taste-test**](../README.md) • **Docs**

***

# Function: divCeil()

> **divCeil**(`a`, `b`): `bigint`

Performs a division operation on two bigints and rounds up the result.

This function takes two bigint numbers, divides the first by the second, and rounds up the result.
The rounding up ensures the result is the smallest integer greater than or equal to the actual division result,
often used when dealing with scenarios where fractional results are not acceptable, and rounding up is required.

Note: This function does not handle cases where 'b' is zero. Zero as the divisor will lead to an error as division by zero is not defined.

## Parameters

• **a**: `bigint`

The dividend represented as a bigint.

• **b**: `bigint`

The divisor represented as a bigint.

## Returns

`bigint`

- The result of the division, rounded up to the nearest bigint.

## Defined in

[taste-test/src/utils.ts:115](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L115)
