[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IOrderRouteSwapArgs

Special arguments for an Order-Route Swap. A combination of
two swap arguments, but simplified for ease-of-use.

`swapB` may be a legacy swap against one pool, or a v4 intent
([IChainLegV4](IChainLegV4.md)) that absorbs the whole v4 tail of a route.

## Properties

### destination?

> `optional` **destination**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Final payout destination. Defaults to `ownerAddress`.

#### Defined in

[packages/core/src/@types/txbuilders.ts:185](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L185)
