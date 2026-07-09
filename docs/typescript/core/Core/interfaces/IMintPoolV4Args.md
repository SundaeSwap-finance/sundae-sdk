[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IMintPoolV4Args

Arguments for creating a v4 pool via [TxBuilderV4.mintPool](../classes/TxBuilderV4.md#mintpool).

## Properties

### assets

> **assets**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

The initial reserves — at least two distinct assets.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:198](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L198)

***

### curve

> **curve**: [`TPoolCurveV4`](../type-aliases/TPoolCurveV4.md)

The curve (pool kind) and its config.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:200](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L200)

***

### ownerAddress

> **ownerAddress**: `string`

The pool creator (bech32) — funds the seed UTxO and receives the circulating LP.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:202](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L202)

***

### totalLp?

> `optional` **totalLp**: `bigint`

Override the initial circulating LP supply (also the preminted buffer). When
omitted it is computed per curve — for constant-sum, `Σ price_i·reserve_i`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:207](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L207)
