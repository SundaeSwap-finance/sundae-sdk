# Class: Config\<Args\>

[Core](../modules/Core.md).Config

The Config class represents a base configuration for all SDK methods.
It is meant to be extended by more specific configuration classes.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Args` | {} | The type of the arguments object, defaulting to an empty object. |

## Hierarchy

- **`Config`**

  ↳ [`OrderConfig`](Core.OrderConfig.md)

## Properties

### referralFee

• `Optional` **referralFee**: [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md)

An optional argument that contains referral fee data.

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

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:24](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L24)

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

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L40)

___

### validate

▸ **validate**(): `void`

A method to validate the current configuration.
Implementations should check their properties and throw errors if they are invalid.

#### Returns

`void`

**`Throws`**

If the configuration is invalid.

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:49](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L49)
