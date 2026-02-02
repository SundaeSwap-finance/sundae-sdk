[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ISwapConfigArgs

The arguments configuration for building a valid Swap.

## Extends

- [`IOrderConfigArgs`](IOrderConfigArgs.md)

## Properties

### feePadding?

> `optional` **feePadding**: `bigint`

Optional extra ADA (lovelace) added to the order deposit. Use when the order output
will fund a subsequent execution (e.g. strategy second swap). If omitted, defaults to 0n.

#### Defined in

[packages/core/src/@types/configs.ts:70](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L70)
