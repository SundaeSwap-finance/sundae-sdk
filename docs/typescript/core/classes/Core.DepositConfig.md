# Class: DepositConfig

[Core](../modules/Core.md).DepositConfig

The main config class for building valid arguments for a Deposit.

## Hierarchy

- `OrderConfig`<[`DepositConfigArgs`](../interfaces/Core.DepositConfigArgs.md)\>

  ↳ **`DepositConfig`**

## Properties

### orderAddresses

• `Optional` **orderAddresses**: [`OrderAddresses`](../modules/Core.md#orderaddresses)

The addresses for the order.

#### Inherited from

OrderConfig.orderAddresses

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L19)

___

### pool

• `Optional` **pool**: [`IPoolData`](../interfaces/Core.IPoolData.md)

The data for the pool involved in the order.

#### Inherited from

OrderConfig.pool

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L14)

## Methods

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`DepositConfig`](Core.DepositConfig.md)

Set the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) | The addresses for the order. |

#### Returns

[`DepositConfig`](Core.DepositConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setOrderAddresses

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L30)

___

### setPool

▸ **setPool**(`pool`): [`DepositConfig`](Core.DepositConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) | The data for the pool involved in the order. |

#### Returns

[`DepositConfig`](Core.DepositConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setPool

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L41)

___

### setReferralFee

▸ **setReferralFee**(`fee`): `void`

An inherited method that allows a config to add an optional referral fee.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fee` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) | The desired fee. |

#### Returns

`void`

#### Inherited from

OrderConfig.setReferralFee

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L39)
