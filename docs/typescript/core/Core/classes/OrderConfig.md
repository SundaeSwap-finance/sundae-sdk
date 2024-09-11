[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: `abstract` OrderConfig\<Args\>

The OrderConfig class extends Config and represents the configuration for an order.
It includes settings such as the pool and order addresses.

## Extends

- [`Config`](Config.md)\<`Args`\>

## Extended by

- [`CancelConfig`](CancelConfig.md)
- [`DepositConfig`](DepositConfig.md)
- [`SwapConfig`](SwapConfig.md)
- [`ZapConfig`](ZapConfig.md)

## Type Parameters

• **Args** = `object`

The type of the arguments object, defaulting to an empty object.

## Properties

### orderAddresses?

> `optional` **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L19)

***

### pool?

> `optional` **pool**: [`IPoolData`](../interfaces/IPoolData.md)

The data for the pool involved in the order.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L14)

***

### referralFee?

> `optional` **referralFee**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

An optional argument that contains referral fee data.

#### Inherited from

[`Config`](Config.md).[`referralFee`](Config.md#referralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L16)

## Methods

### buildArgs()

> `abstract` **buildArgs**(): `Args`

An abstract method to build the arguments for the configuration.
Implementations should take an object of arguments and return a potentially modified version of it.

#### Returns

`Args`

The potentially modified arguments.

#### Throws

If validation fails.

#### Inherited from

[`Config`](Config.md).[`buildArgs`](Config.md#buildargs)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:33](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L33)

***

### setFromObject()

> `abstract` **setFromObject**(`obj`): `void`

An abstract method to set the configuration from an object.
Implementations should take an object and use it to set their own properties.

#### Parameters

• **obj**: `object`

The object from which to set the configuration.

#### Returns

`void`

#### Inherited from

[`Config`](Config.md).[`setFromObject`](Config.md#setfromobject)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:24](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L24)

***

### setOrderAddresses()

> **setOrderAddresses**(`orderAddresses`): [`OrderConfig`](OrderConfig.md)\<`Args`\>

Set the addresses for a swap's required datum.

#### Parameters

• **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Returns

[`OrderConfig`](OrderConfig.md)\<`Args`\>

The current instance of the class.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

***

### setPool()

> **setPool**(`pool`): [`OrderConfig`](OrderConfig.md)\<`Args`\>

Set the pool data directly for the swap you use.

#### Parameters

• **pool**: [`IPoolData`](../interfaces/IPoolData.md)

The data for the pool involved in the order.

#### Returns

[`OrderConfig`](OrderConfig.md)\<`Args`\>

The current instance of the class.

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L37)

***

### setReferralFee()

> **setReferralFee**(`fee`): `void`

An inherited method that allows a config to add an optional referral fee.

#### Parameters

• **fee**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

The desired fee.

#### Returns

`void`

#### Inherited from

[`Config`](Config.md).[`setReferralFee`](Config.md#setreferralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L40)

***

### validate()

> **validate**(): `void`

Validates the current configuration.
If the pool or the order addresses are not set, it throws an error.

#### Returns

`void`

#### Throws

If the pool or the order addresses are not set.

#### Overrides

[`Config`](Config.md).[`validate`](Config.md#validate)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L47)
