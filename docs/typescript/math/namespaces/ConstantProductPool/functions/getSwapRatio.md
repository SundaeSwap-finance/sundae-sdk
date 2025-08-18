[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: getSwapRatio()

> **getSwapRatio**(`direction`, `assets`): [`IRatioCalculationResult`](../../SharedPoolMath/interfaces/IRatioCalculationResult.md)

Calculates the swap ratio between two assets and returns an AssetAmount instance representing this ratio.

The assets are first sorted lexicographically by their assetId to ensure any calculation will match
pool ratios (which are also sorted lexicographically when created). The direction of the swap determines the calculation.
For 'A_PER_B', it calculates how much of the lexicographically first asset (A) is obtained for each unit of the
lexicographically second asset (B). For 'B_PER_A', it calculates how much of the lexicographically second asset (B)
is obtained for each unit of the lexicographically first asset (A).

The returned AssetAmount is represented in the decimal format of the asset that is being received in the swap operation.
In 'A_PER_B' direction, the lexicographically first asset (A) is received, so the AssetAmount will be in the decimal format
of Asset A. In 'B_PER_A' direction, the lexicographically second asset (B) is received, so the AssetAmount will be in the decimal format of Asset B.

## Parameters

• **direction**: [`TRatioDirection`](../../SharedPoolMath/type-aliases/TRatioDirection.md)

The direction of the swap: 'A_PER_B' means the first asset lexicographically is received and the second is given, 'B_PER_A' means the second asset lexicographically is received and the first is given.

• **assets**: [[`IRatioCalculationAsset`](../../SharedPoolMath/interfaces/IRatioCalculationAsset.md), [`IRatioCalculationAsset`](../../SharedPoolMath/interfaces/IRatioCalculationAsset.md)]

An array of two assets involved in the swap. The order of the assets in this array does not matter as they will be sorted lexicographically by their assetId inside the function.

## Returns

[`IRatioCalculationResult`](../../SharedPoolMath/interfaces/IRatioCalculationResult.md)

The calculated swap ratio in different representations.

## Example

```ts
const asset1 = { quantity: 100, decimals: 0, assetId: 'B' };
const asset2 = { quantity: 2000000, decimals: 6, assetId: 'A' };
const amount = getSwapRatio('A_PER_B', [asset1, asset2]);
const sameAmount = getSwapRatio('A_PER_B', [asset2, asset1]);
console.log(amount.ratioAsFraction); // Returns a Fraction class of the ratio.
console.log(sameAmount.ratioAsFraction); // Same as above.
```

## Defined in

[ConstantProductPool.ts:315](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantProductPool.ts#L315)
