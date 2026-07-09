[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IBasicV4Args

Arguments for placing a v4 basic order via `TxBuilderV4.basic`/`deposit`/`withdraw`.

## Extends

- [`IOrderV4Base`](IOrderV4Base.md)

## Properties

### budget?

> `optional` **budget**: `bigint`

Max batcher fee, in lovelace. Defaults to `DEFAULT_BUDGET` (3 ADA).

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`budget`](IOrderV4Base.md#budget)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:79](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L79)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:88](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L88)

***

### destination?

> `optional` **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`destination`](IOrderV4Base.md#destination)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L77)

***

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The minimum received, per asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L109)

***

### offered

> **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The assets (and amounts) offered.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L107)

***

### ownerAddress

> **ownerAddress**: `string`

The order owner (bech32). Also the default payout destination.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`ownerAddress`](IOrderV4Base.md#owneraddress)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L75)

***

### shareBatcher?

> `optional` **shareBatcher**: `bigint`

The batcher's share of the fee. Defaults to `DEFAULT_SHARE_BATCHER`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`shareBatcher`](IOrderV4Base.md#sharebatcher)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:81](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L81)

***

### type

> **type**: [`EV4BasicConstraint`](../enumerations/EV4BasicConstraint.md)

Deposit / Withdraw / Claim.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:105](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L105)
