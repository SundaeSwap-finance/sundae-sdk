[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IOrderV4Base

Shared shape for placing a v4 order. `budget` is the max batcher fee the
order will pay (lovelace); `configToken` is the asset name of the OrderConfig
settings entry this order's constraints must satisfy. Both are protocol/
settings-derived; until the protocol query exposes them they are supplied
here explicitly.

## Extended by

- [`ISwapV4Args`](ISwapV4Args.md)
- [`IBasicV4Args`](IBasicV4Args.md)
- [`IStrategyV4Args`](IStrategyV4Args.md)

## Properties

### budget?

> `optional` **budget**: `bigint`

Lifetime service-fee allocation (`service_budget`), in lovelace. Defaults
to `DEFAULT_BUDGET` (3 ADA).

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:111](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L111)

***

### configToken?

> `optional` **configToken**: `string`

The OrderConfig settings-entry asset name whose `required_constraints` this
order fulfills. Optional — when omitted it is resolved from the protocol
query's indexed settings (the entry labeled `swap-order` / `basic-order`).
Pass it explicitly to override, or if the API isn't serving settings yet.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:127](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L127)

***

### destination?

> `optional` **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:106](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L106)

***

### maxPerExecution?

> `optional` **maxPerExecution**: `bigint`

Flat per-scoop fee cap (`max_per_execution`), in lovelace — also the
terminal-settlement amount, and the scooper's routing-fan-out budget
(`maxPerExecution / costPerPool` pools). Defaults to
`baseFee + 2·feePerStep` from the protocol's fee settings, falling back to
`DEFAULT_MAX_PER_EXECUTION` (2 ADA). Too small a value makes the order
unroutable: below `baseFee` the scooper can't afford a single pool.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:120](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L120)

***

### ownerAddress

> **ownerAddress**: `string`

The order owner (bech32). Also the default payout destination.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:104](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L104)
