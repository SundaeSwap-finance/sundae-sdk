[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TV4ChainFirstLeg

> **TV4ChainFirstLeg**: `Omit`\<[`ISwapV4Args`](../interfaces/ISwapV4Args.md), `"ownerAddress"` \| `"destination"` \| `"minReceived"`\> & `object`

The first order of a chain that starts on v4: the v4 order the transaction
places. `minReceived` is a single asset because it is exactly what the next
order offers, so it must be one of that order's pool assets.

## Type declaration

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:223](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L223)
