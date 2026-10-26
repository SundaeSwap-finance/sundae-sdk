[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IOrderRouteSwapV4Args

Arguments for [TxBuilderV4.orderRouteSwap](../classes/TxBuilderV4.md#orderrouteswap).

## Properties

### destination?

> `optional` **destination**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where the last order pays out. Defaults to `ownerAddress`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:241](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L241)

***

### legs

> **legs**: [[`TV4ChainFirstLeg`](../type-aliases/TV4ChainFirstLeg.md), [`TChainLeg`](../type-aliases/TChainLeg.md), `...TChainLeg[]`]

The orders, in the order they fill. The first is the v4 order this
transaction places; each later order is the one the order before it pays
into.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:239](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L239)

***

### ownerAddress

> **ownerAddress**: `string`

Owns every order in the chain, and is the only party that can cancel one.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:233](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L233)
