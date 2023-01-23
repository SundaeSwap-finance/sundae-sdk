# Class: DepositConfig

[Core](../modules/Core.md).DepositConfig

The main config class for building valid arguments for a Deposit.

## Hierarchy

- `OrderConfig`

  ↳ **`DepositConfig`**

## Methods

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`DepositConfig`](Core.DepositConfig.md)

Builds the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

[`DepositConfig`](Core.DepositConfig.md)

#### Inherited from

OrderConfig.setOrderAddresses

#### Defined in

[classes/OrderConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/OrderConfig.abstract.class.ts#L14)

___

### setPool

▸ **setPool**(`pool`): [`DepositConfig`](Core.DepositConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) |

#### Returns

[`DepositConfig`](Core.DepositConfig.md)

#### Inherited from

OrderConfig.setPool

#### Defined in

[classes/OrderConfig.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/OrderConfig.abstract.class.ts#L25)
