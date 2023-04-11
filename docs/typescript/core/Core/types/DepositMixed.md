---
title: "DepositMixed"
---

# DepositMixed

> `object`

```ts
{
    CoinAAmount: AssetAmount;
    CoinBAmount: AssetAmount;
}
```

The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
shifts after the order is placed but before it is scooped, the LP tokens along with
the remaining asset gets sent to the [DestinationAddress](DestinationAddress.md)

## Type declaration

| Member | Type |
| :------ | :------ |
| `CoinAAmount` | [`AssetAmount`](../classes/AssetAmount.md) |
| `CoinBAmount` | [`AssetAmount`](../classes/AssetAmount.md) |

Defined in:  [@types/datumbuilder.ts:88](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L88)
