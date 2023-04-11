---
title: "DepositSingle"
---

# DepositSingle

> `object`

```ts
{
    CoinAmount: AssetAmount;
    ZapDirection: PoolCoin;
}
```

A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
receivable amount to satisfy a pool's CoinA/CoinB requirements.

## Type declaration

| Member | Type |
| :------ | :------ |
| `CoinAmount` | [`AssetAmount`](../classes/AssetAmount.md) |
| `ZapDirection` | [`PoolCoin`](../enums/PoolCoin.md) |

Defined in:  [@types/datumbuilder.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L78)
