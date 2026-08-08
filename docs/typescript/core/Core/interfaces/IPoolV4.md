[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolV4

A decoded v4 pool — the shape returned by [TxBuilderV4.getPoolByIdent](../classes/TxBuilderV4.md#getpoolbyident).
Unlike the 2-asset `IPoolData`, this represents the full v4 `PoolDatum`
(2–16 assets for constant-sum) and the CIP-68 LP/NFT asset ids, so callers
can build deposit/withdraw orders against it.

## Properties

### assets

> **assets**: `object`[]

Reserves, in pool-datum order. `assetId` is `policy.name` (`ada.lovelace` for ADA).

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:258](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L258)

***

### ident

> **ident**: `string`

The pool identifier (28-byte hex).

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:256](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L256)

***

### lpAssetId

> **lpAssetId**: `string`

The pool's LP token (`policy.name`), i.e. the `333` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:264](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L264)

***

### nftAssetId

> **nftAssetId**: `string`

The pool's NFT (`policy.name`), i.e. the `222` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:266](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L266)

***

### totalLp

> **totalLp**: `bigint`

LP accounting from the pool datum.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:260](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L260)

***

### utxo

> **utxo**: `TransactionUnspentOutput`

The live pool UTxO.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:268](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L268)
