[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IOrderRouteSwapV4Args

Arguments for [TxBuilderV4.orderRouteSwap](../classes/TxBuilderV4.md#orderrouteswap): a chain of orders that
starts with a v4 order. The v4 order pays into a v3 or stableswap order
(`swapB`), which can pay into one more order (`swapC`).

## Properties

### destination?

> `optional` **destination**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where the last order pays out. Defaults to `ownerAddress`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:242](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L242)

***

### ownerAddress

> **ownerAddress**: `string`

Owns every order in the chain, and is the only party that can cancel one.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:226](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L226)

***

### swapA

> **swapA**: `Omit`\<[`ISwapV4Args`](ISwapV4Args.md), `"minReceived"` \| `"destination"` \| `"ownerAddress"`\> & `object`

The first order, on v4. `minReceived` is a single asset because it is
exactly what `swapB` offers, so it must be one of `swapB`'s pool assets.

#### Type declaration

##### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:231](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L231)

***

### swapB

> **swapB**: [`TChainLegLegacy`](../type-aliases/TChainLegLegacy.md)

The second order, which `swapA` pays into: a v3 or stableswap swap.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:235](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L235)

***

### swapC?

> `optional` **swapC**: [`TChainLeg`](../type-aliases/TChainLeg.md)

An optional third order, which `swapB` pays into: a v4 order (covering
any number of v4 pools), or a v3 or stableswap swap.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:240](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L240)
