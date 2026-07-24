[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IStrategyV4Args

Arguments for placing a v4 strategy order via `TxBuilderV4.strategy`. The
order locks the offered assets; a designated strategist later signs a
`StrategyExecution` (off-chain) that the scooper fills. The order carries the
full `[strategy-order, route-order, fairness-order]` constraint set.

## Extends

- [`IOrderV4Base`](IOrderV4Base.md)

## Properties

### authSigner

> **authSigner**: `string` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

The party authorized to sign executions — a bech32 address (single-`Signature`
auth) or an explicit `MultisigScript` for richer authorization.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:165](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L165)

***

### budget?

> `optional` **budget**: `bigint`

Lifetime service-fee allocation (`service_budget`), in lovelace. Defaults
to `DEFAULT_BUDGET` (3 ADA).

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`budget`](IOrderV4Base.md#budget)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L112)

***

### configToken?

> `optional` **configToken**: `string`

The OrderConfig settings-entry asset name whose `required_constraints` this
order fulfills. Optional — when omitted it is resolved from the protocol
query's indexed settings (the entry labeled `swap-order` / `basic-order`).
Pass it explicitly to override, or if the API isn't serving settings yet.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`configToken`](IOrderV4Base.md#configtoken)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:128](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L128)

***

### destination?

> `optional` **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`destination`](IOrderV4Base.md#destination)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L107)

***

### finalDestinations?

> `optional` **finalDestinations**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)[]

Allowed final payout destinations an execution may route to (an execution
picks one by index, or falls back to the order's own destination).
Defaults to `[]`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:171](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L171)

***

### maxPerExecution?

> `optional` **maxPerExecution**: `bigint`

Flat per-scoop fee cap (`max_per_execution`), in lovelace — also the
terminal-settlement amount, and the scooper's routing-fan-out budget
(`maxPerExecution / costPerPool` pools). Defaults to
`baseFee + 2·feePerStep` from the protocol's fee settings, falling back to
`DEFAULT_MAX_PER_EXECUTION` (2 ADA). Too small a value makes the order
unroutable: below `baseFee` the scooper can't afford a single pool.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`maxPerExecution`](IOrderV4Base.md#maxperexecution)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:121](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L121)

***

### offered

> **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The assets (and amounts) locked for the strategy to execute against.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L160)

***

### ownerAddress

> **ownerAddress**: `string`

The order owner (bech32). Also the default payout destination.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`ownerAddress`](IOrderV4Base.md#owneraddress)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:105](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L105)
