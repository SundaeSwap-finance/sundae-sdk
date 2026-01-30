[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IFeesConfig

Configuration interface for fee basis points in liquidity pools.
Fees are represented as basis points (1 basis point = 0.01%).

In trading terminology:
- "bid" typically refers to buying (swapping into the pool)
- "ask" typically refers to selling (swapping out of the pool)

For example, a value of 30n represents 0.30% (30 basis points).

## Properties

### ask

> **ask**: `bigint`

The ask fee in basis points, applied when swapping out of the pool.

#### Defined in

[packages/core/src/@types/configs.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L139)

***

### bid

> **bid**: `bigint`

The bid fee in basis points, applied when swapping into the pool.

#### Defined in

[packages/core/src/@types/configs.ts:144](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L144)
