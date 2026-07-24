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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:240](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L240)

***

### ident

> **ident**: `string`

The pool identifier (28-byte hex).

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:238](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L238)

***

### lpAssetId

> **lpAssetId**: `string`

The pool's LP token (`policy.name`), i.e. the `333` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:246](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L246)

***

### nftAssetId

> **nftAssetId**: `string`

The pool's NFT (`policy.name`), i.e. the `222` asset.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:248](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L248)

***

### totalLp

> **totalLp**: `bigint`

LP accounting from the pool datum.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:242](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L242)

***

### utxo

> **utxo**: `TransactionUnspentOutput`

The live pool UTxO.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:250](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L250)
