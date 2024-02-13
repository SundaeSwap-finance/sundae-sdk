# Class: OrderConfig\<Args\>

[Core](../modules/Core.md).OrderConfig

The OrderConfig class extends Config and represents the configuration for an order.
It includes settings such as the pool and order addresses.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Args` | {} | The type of the arguments object, defaulting to an empty object. |

## Hierarchy

- [`Config`](Core.Config.md)\<`Args`\>

  ↳ **`OrderConfig`**

  ↳↳ [`CancelConfig`](Core.CancelConfig.md)

  ↳↳ [`DepositConfig`](Core.DepositConfig.md)

  ↳↳ [`SwapConfig`](Core.SwapConfig.md)

  ↳↳ [`WithdrawConfig`](Core.WithdrawConfig.md)

  ↳↳ [`ZapConfig`](Core.ZapConfig.md)

## Properties

### orderAddresses

• `Optional` **orderAddresses**: [`TOrderAddresses`](../modules/Core.md#torderaddresses)

The addresses for the order.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L19)

___

### pool

• `Optional` **pool**: [`IPoolData`](../interfaces/Core.IPoolData.md)

The data for the pool involved in the order.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L14)

___

### referralFee

• `Optional` `Abstract` **referralFee**: [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md)

An optional argument that contains referral fee data.

#### Inherited from

[Config](Core.Config.md).[referralFee](Core.Config.md#referralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L16)

## Methods

### buildArgs

▸ **buildArgs**(): `Args`

An abstract method to build the arguments for the configuration.
Implementations should take an object of arguments and return a potentially modified version of it.

#### Returns

`Args`

The potentially modified arguments.

**`Abstract`**

**`Throws`**

If validation fails.

#### Inherited from

[Config](Core.Config.md).[buildArgs](Core.Config.md#buildargs)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:33](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L33)

___

### setFromObject

▸ **setFromObject**(`obj`): `void`

An abstract method to set the configuration from an object.
Implementations should take an object and use it to set their own properties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `Object` | The object from which to set the configuration. |

#### Returns

`void`

**`Abstract`**

#### Inherited from

[Config](Core.Config.md).[setFromObject](Core.Config.md#setfromobject)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:24](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L24)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`OrderConfig`](Core.OrderConfig.md)\<`Args`\>

Set the [Core.TOrderAddresses](../modules/Core.md#torderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`TOrderAddresses`](../modules/Core.md#torderaddresses) | The addresses for the order. |

#### Returns

[`OrderConfig`](Core.OrderConfig.md)\<`Args`\>

The current instance of the class.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

___

### setPool

▸ **setPool**(`pool`): [`OrderConfig`](Core.OrderConfig.md)\<`Args`\>

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) | The data for the pool involved in the order. |

#### Returns

[`OrderConfig`](Core.OrderConfig.md)\<`Args`\>

The current instance of the class.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L37)

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

[Config](Core.Config.md).[setReferralFee](Core.Config.md#setreferralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L40)

___

### validate

▸ **validate**(): `void`

Validates the current configuration.
If the pool or the order addresses are not set, it throws an error.

#### Returns

`void`

**`Throws`**

If the pool or the order addresses are not set.

#### Overrides

[Config](Core.Config.md).[validate](Core.Config.md#validate)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L47)
