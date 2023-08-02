# Class: CancelConfig

[Core](../modules/Core.md).CancelConfig

The main config class for building valid arguments for a Cancel.

## Hierarchy

- `OrderConfig`<[`CancelConfigArgs`](../interfaces/Core.CancelConfigArgs.md)\>

  ↳ **`CancelConfig`**

## Properties

### orderAddresses

• `Optional` **orderAddresses**: [`OrderAddresses`](../modules/Core.md#orderaddresses)

The addresses for the order.

#### Inherited from

OrderConfig.orderAddresses

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:21](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L21)

___

### pool

• `Optional` **pool**: [`IPoolData`](../interfaces/Core.IPoolData.md)

The data for the pool involved in the order.

#### Inherited from

OrderConfig.pool

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L16)

## Methods

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`CancelConfig`](Core.CancelConfig.md)

Set the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) | The addresses for the order. |

#### Returns

[`CancelConfig`](Core.CancelConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setOrderAddresses

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:32](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L32)

___

### setPool

▸ **setPool**(`pool`): [`CancelConfig`](Core.CancelConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) | The data for the pool involved in the order. |

#### Returns

[`CancelConfig`](Core.CancelConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setPool

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L43)

___

### setSkipReferral

▸ **setSkipReferral**(`val?`): `void`

An inherited method that allows a config to skip the configured referral fee if set.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `val?` | `boolean` | Whether to skip the referral fee or not. |

#### Returns

`void`

#### Inherited from

OrderConfig.setSkipReferral

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:35](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L35)
