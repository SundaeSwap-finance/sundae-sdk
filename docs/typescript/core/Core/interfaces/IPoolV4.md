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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:261](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L261)

***

### ident

> **ident**: `string`

The pool identifier (28-byte hex).

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:259](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L259)

***

### lpAssetId

> **lpAssetId**: `string`

The pool's LP token (`policy.name`), i.e. the `333` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:267](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L267)

***

### nftAssetId

> **nftAssetId**: `string`

The pool's NFT (`policy.name`), i.e. the `222` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:269](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L269)

***

### totalLp

> **totalLp**: `bigint`

LP accounting from the pool datum.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:263](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L263)

***

### utxo

> **utxo**: `TransactionUnspentOutput`

The live pool UTxO.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:271](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L271)
