# Class: ZapConfig

[Core](../modules/Core.md).ZapConfig

The main config class for building valid arguments for a Zap.

## Hierarchy

- [`OrderConfig`](Core.OrderConfig.md)\<[`IZapConfigArgs`](../interfaces/Core.IZapConfigArgs.md)\>

  ↳ **`ZapConfig`**

## Properties

### orderAddresses

• `Optional` **orderAddresses**: [`TOrderAddresses`](../modules/Core.md#torderaddresses)

The addresses for the order.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[orderAddresses](Core.OrderConfig.md#orderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L19)

___

### pool

• `Optional` **pool**: [`IPoolData`](../interfaces/Core.IPoolData.md)

The data for the pool involved in the order.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[pool](Core.OrderConfig.md#pool)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L14)

___

### referralFee

• `Optional` **referralFee**: [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md)

An optional argument that contains referral fee data.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[referralFee](Core.OrderConfig.md#referralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L16)

## Methods

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`ZapConfig`](Core.ZapConfig.md)

Set the [Core.TOrderAddresses](../modules/Core.md#torderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`TOrderAddresses`](../modules/Core.md#torderaddresses) | The addresses for the order. |

#### Returns

[`ZapConfig`](Core.ZapConfig.md)

The current instance of the class.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[setOrderAddresses](Core.OrderConfig.md#setorderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

___

### setPool

▸ **setPool**(`pool`): [`ZapConfig`](Core.ZapConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) | The data for the pool involved in the order. |

#### Returns

[`ZapConfig`](Core.ZapConfig.md)

The current instance of the class.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[setPool](Core.OrderConfig.md#setpool)

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

[OrderConfig](Core.OrderConfig.md).[setReferralFee](Core.OrderConfig.md#setreferralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L40)
