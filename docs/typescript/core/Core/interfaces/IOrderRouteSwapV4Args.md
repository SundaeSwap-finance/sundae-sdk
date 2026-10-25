[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IOrderRouteSwapV4Args

Arguments for a chained swap that STARTS on v4, via
[TxBuilderV4.orderRouteSwap](../classes/TxBuilderV4.md#orderrouteswap): a v4 intent that pays into a legacy
order, optionally followed by one more leg.

## Properties

### destination?

> `optional` **destination**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Final payout destination. Defaults to `ownerAddress`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:242](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L242)

***

### ownerAddress

> **ownerAddress**: `string`

Owns every leg, and is the only party that can cancel one.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:226](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L226)

***

### swapA

> **swapA**: `Omit`\<[`ISwapV4Args`](ISwapV4Args.md), `"minReceived"` \| `"destination"` \| `"ownerAddress"`\> & `object`

The v4 leg. Its single `minReceived` asset is what `swapB` offers, so it
must be one of `swapB`'s pool assets.

#### Type declaration

##### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:231](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L231)

***

### swapB

> **swapB**: [`TChainLegLegacy`](../type-aliases/TChainLegLegacy.md)

The legacy leg the v4 leg pays into: a v3 or stableswap swap.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:235](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L235)

***

### swapC?

> `optional` **swapC**: [`TChainLeg`](../type-aliases/TChainLeg.md)

An optional leg after `swapB`: a v4 intent (a whole v4 tail), or a v3 or
stableswap swap.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:240](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L240)
