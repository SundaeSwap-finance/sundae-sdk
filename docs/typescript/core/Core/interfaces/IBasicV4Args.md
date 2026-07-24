[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IBasicV4Args

Arguments for placing a v4 basic order via `TxBuilderV4.basic`/`deposit`/`withdraw`.

## Extends

- [`IOrderV4Base`](IOrderV4Base.md)

## Properties

### budget?

> `optional` **budget**: `bigint`

Lifetime service-fee allocation (`service_budget`), in lovelace. Defaults
to `DEFAULT_BUDGET` (3 ADA).

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`budget`](IOrderV4Base.md#budget)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:111](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L111)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:127](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L127)

***

### destination?

> `optional` **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`destination`](IOrderV4Base.md#destination)

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

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`maxPerExecution`](IOrderV4Base.md#maxperexecution)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:120](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L120)

***

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The minimum received, per asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:148](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L148)

***

### offered

> **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The assets (and amounts) offered.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:146](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L146)

***

### ownerAddress

> **ownerAddress**: `string`

The order owner (bech32). Also the default payout destination.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`ownerAddress`](IOrderV4Base.md#owneraddress)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:104](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L104)

***

### type

> **type**: [`EV4BasicConstraint`](../enumerations/EV4BasicConstraint.md)

Deposit / Withdraw / Claim.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:144](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L144)
