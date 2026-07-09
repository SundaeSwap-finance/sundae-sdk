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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:221](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L221)

***

### ident

> **ident**: `string`

The pool identifier (28-byte hex).

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:219](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L219)

***

### lpAssetId

> **lpAssetId**: `string`

The pool's LP token (`policy.name`), i.e. the `333` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:227](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L227)

***

### nftAssetId

> **nftAssetId**: `string`

The pool's NFT (`policy.name`), i.e. the `222` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:229](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L229)

***

### totalLp

> **totalLp**: `bigint`

LP accounting from the pool datum.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:223](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L223)

***

### utxo

> **utxo**: `TransactionUnspentOutput`

The live pool UTxO.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:231](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L231)
