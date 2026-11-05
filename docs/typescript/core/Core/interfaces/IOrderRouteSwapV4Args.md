[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IOrderRouteSwapV4Args

Arguments for [TxBuilderV4.orderRouteSwap](../classes/TxBuilderV4.md#orderrouteswap).

## Properties

### destination?

> `optional` **destination**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where the last order pays out. Defaults to `ownerAddress`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:248](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L248)

***

### legs

> **legs**: [[`TV4ChainFirstLeg`](../type-aliases/TV4ChainFirstLeg.md), [`TChainLeg`](../type-aliases/TChainLeg.md), `...TChainLeg[]`]

The orders, in the order they fill. The first is the v4 order this
transaction places; each later order is the one the order before it pays
into.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:246](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L246)

***

### ownerAddress

> **ownerAddress**: `string`

Owns every order in the chain, and is the only party that can cancel one.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:240](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L240)
