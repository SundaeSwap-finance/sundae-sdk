---
title: "Swap"
---

# Swap

> `object`

```ts
{
    MinimumReceivable?: AssetAmount;
    SuppliedCoin: PoolCoin;
}
```

The swap direction of a [IAsset](../interfaces/IAsset.md) coin pair, and a minimum receivable amount
which acts as the limit price of a swap.

## Type declaration

| Member | Type |
| :------ | :------ |
| `MinimumReceivable`? | [`AssetAmount`](../classes/AssetAmount.md) |
| `SuppliedCoin` | [`PoolCoin`](../enums/PoolCoin.md) |

Defined in:  [@types/datumbuilder.ts:63](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L63)
