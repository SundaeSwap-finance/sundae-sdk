[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IStrategyConfigArgs

The arguments configuration for building a valid Strategy.

## Extends

- `Omit`\<[`IOrderConfigArgs`](IOrderConfigArgs.md), `"orderAddresses"`\>

## Properties

### executionCount?

> `optional` **executionCount**: `bigint`

The number of executions planned for this strategy.
Used to calculate the total scooper fees required.
Defaults to 1n if not provided.

#### Defined in

[packages/core/src/@types/configs.ts:117](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L117)
