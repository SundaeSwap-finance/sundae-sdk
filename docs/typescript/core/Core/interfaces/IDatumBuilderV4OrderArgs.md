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

The maximum protocol/batcher fee (lovelace) the order will pay.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L44)

***

### configToken

> **configToken**: `string`

The asset name of the config token identifying the protocol config.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L48)

***

### constraints

> **constraints**: [`string`, `PlutusData`][]

The `(module_hash, data)` constraint entries.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L50)

***

### destination

> **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where the order pays out, or `Self` to re-lock at the order address.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L42)

***

### extension?

> `optional` **extension**: `PlutusData`

Arbitrary extension data. Defaults to `Void`.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L52)

***

### owner

> **owner**: `string` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

The address (or explicit multisig) that owns / can cancel the order.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L40)

***

### shareBatcher

> **shareBatcher**: `bigint`

The batcher's share of the fee.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L46)
