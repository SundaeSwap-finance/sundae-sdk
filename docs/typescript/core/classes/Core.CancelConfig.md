# Class: CancelConfig

[Core](../modules/Core.md).CancelConfig

The main config class for building valid arguments for a Cancel.

## Hierarchy

- `Config`<[`CancelConfigArgs`](../interfaces/Core.CancelConfigArgs.md)\>

  ↳ **`CancelConfig`**

## Methods

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`CancelConfig`](Core.CancelConfig.md)

Builds the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

[`CancelConfig`](Core.CancelConfig.md)

#### Inherited from

Config.setOrderAddresses

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L14)

___

### setPool

▸ **setPool**(`pool`): [`CancelConfig`](Core.CancelConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) |

#### Returns

[`CancelConfig`](Core.CancelConfig.md)

#### Inherited from

Config.setPool

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L25)
