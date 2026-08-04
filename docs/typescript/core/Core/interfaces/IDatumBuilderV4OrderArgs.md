[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IDatumBuilderV4OrderArgs

The arguments to assemble a v4 `OrderDatum` shell.

The `constraints` are the generic `(module_hash, data)` pairs that make v4
orders composable — each entry names a withdraw-validator module and the
opaque `Data` payload that module interprets. This builder does NOT encode
those payloads (they live outside the blueprint and differ per module); the
caller supplies pre-serialized `Core.PlutusData` for each. See the
per-module constraint encoders (Phase 3+) for the swap/deposit/withdraw
payload construction.

## Properties

### budget

> **budget**: `bigint`

The order's lifetime service-fee allocation (lovelace), decremented by
each execution's fee (see sundae-v4 docs/fee-system.md).

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:56](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L56)

***

### configToken

> **configToken**: `string`

The asset name of the config token identifying the protocol config.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L64)

***

### constraints

> **constraints**: [`string`, `PlutusData`][]

The `(module_hash, data)` constraint entries.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L66)

***

### destination

> **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where the order pays out, or `Self` to re-lock at the order address.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L51)

***

### extension?

> `optional` **extension**: `PlutusData`

Arbitrary extension data. Defaults to `Void`.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L68)

***

### maxPerExecution

> **maxPerExecution**: `bigint`

The flat cap on lovelace deducted in a single scoop — also the terminal-
settlement amount, and what buys the scooper's routing fan-out
(`maxPerExecution / costPerPool` pools).

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L62)

***

### owner

> **owner**: `string` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

The address (or explicit multisig) that owns / can cancel the order.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:49](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L49)
