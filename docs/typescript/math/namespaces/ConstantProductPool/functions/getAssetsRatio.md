[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getAssetsRatio()

> **getAssetsRatio**(`firstValue`, `secondValue`): `string`

Calculates the ratio between two values.

## Parameters

• **firstValue**: `TFractionLike`

The first value for the ratio calculation.

• **secondValue**: `TFractionLike`

The second value for the ratio calculation.

## Returns

`string`

The ratio of the first value to the second value, expressed as a string in base 10. If either of the inputs is zero or negative, or if either input is missing, the function returns null.

## Throws

Will throw an error if the inputs are not valid for the Fraction class's `asFraction` method.

## Defined in

[ConstantProductPool.ts:274](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantProductPool.ts#L274)
