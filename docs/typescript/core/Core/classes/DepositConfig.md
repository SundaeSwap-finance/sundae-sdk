---
title: "DepositConfig"
---

# DepositConfig

The main config class for building valid arguments for a Deposit.

## Hierarchy

- `Config`\<[`IDepositArgs`](../interfaces/IDepositArgs.md)\>.**DepositConfig**

## Methods

### setOrderAddresses()

Builds the [OrderAddresses](../types/OrderAddresses.md) for a swap's required datum.

#### Signature

```ts
setOrderAddresses(orderAddresses: OrderAddresses): DepositConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../types/OrderAddresses.md) |

#### Returns

[`DepositConfig`](DepositConfig.md)

Inherited from: Config.setOrderAddresses

Defined in:  [classes/Abstracts/Config.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L14)

### setPool()

Set the pool data directly for the swap you use.

#### Signature

```ts
setPool(pool: IPoolData): DepositConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/IPoolData.md) |

#### Returns

[`DepositConfig`](DepositConfig.md)

Inherited from: Config.setPool

Defined in:  [classes/Abstracts/Config.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L25)
