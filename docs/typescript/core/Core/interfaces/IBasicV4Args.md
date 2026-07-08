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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L69)

***

### configToken

> **configToken**: `string`

The OrderConfig settings-entry asset name whose `required_constraints` this
order fulfills. Deployment-specific (a minted registry token, per order
type); resolve it from the OrderConfig settings entries. See the note on
config-token resolution in the class docs.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`configToken`](IOrderV4Base.md#configtoken)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L78)

***

### destination?

> `optional` **destination**: `"Self"` \| [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`destination`](IOrderV4Base.md#destination)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:67](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L67)

***

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The minimum received, per asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:99](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L99)

***

### offered

> **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The assets (and amounts) offered.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:97](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L97)

***

### ownerAddress

> **ownerAddress**: `string`

The order owner (bech32). Also the default payout destination.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`ownerAddress`](IOrderV4Base.md#owneraddress)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:65](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L65)

***

### shareBatcher?

> `optional` **shareBatcher**: `bigint`

The batcher's share of the fee. Defaults to `DEFAULT_SHARE_BATCHER`.

#### Inherited from

[`IOrderV4Base`](IOrderV4Base.md).[`shareBatcher`](IOrderV4Base.md#sharebatcher)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:71](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L71)

***

### type

> **type**: [`EV4BasicConstraint`](../enumerations/EV4BasicConstraint.md)

Deposit / Withdraw / Claim.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L95)
