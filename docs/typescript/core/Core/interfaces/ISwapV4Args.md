[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ISwapV4Args

Arguments for placing a v4 swap order via `TxBuilderV4.swap`.

## Extends

- [`IOrderV4Base`](IOrderV4Base.md)

## Properties

### budget?

> `optional` **budget**: `bigint`

Max batcher fee, in lovelace. Defaults to `DEFAULT_BUDGET` (3 ADA).

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`budget`](IOrderV4Base.md#budget)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L100)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L109)

***

### destination?

> `optional` **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`destination`](IOrderV4Base.md#destination)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:98](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L98)

***

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\> \| `AssetAmount`\<`IAssetAmountMetadata`\>[]

The minimum the owner will accept, per asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L118)

***

### offered

> **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>

The asset (and amount) being offered into the swap.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:116](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L116)

***

### ownerAddress

> **ownerAddress**: `string`

The order owner (bech32). Also the default payout destination.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`ownerAddress`](IOrderV4Base.md#owneraddress)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:96](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L96)

***

### shareBatcher?

> `optional` **shareBatcher**: `bigint`

The batcher's share of the fee. Defaults to `DEFAULT_SHARE_BATCHER`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`shareBatcher`](IOrderV4Base.md#sharebatcher)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L102)
