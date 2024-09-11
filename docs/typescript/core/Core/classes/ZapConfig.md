[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: ZapConfig

The main config class for building valid arguments for a Zap.

## Extends

- [`OrderConfig`](OrderConfig.md)\<[`IZapConfigArgs`](../interfaces/IZapConfigArgs.md)\>

## Properties

### orderAddresses?

> `optional` **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Inherited from

[`OrderConfig`](OrderConfig.md).[`orderAddresses`](OrderConfig.md#orderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L19)

***

### pool?

> `optional` **pool**: [`IPoolData`](../interfaces/IPoolData.md)

The data for the pool involved in the order.

#### Inherited from

[`OrderConfig`](OrderConfig.md).[`pool`](OrderConfig.md#pool)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L14)

***

### referralFee?

> `optional` **referralFee**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

An optional argument that contains referral fee data.

#### Inherited from

[`OrderConfig`](OrderConfig.md).[`referralFee`](OrderConfig.md#referralfee)

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L16)

## Methods

### buildArgs()

> `abstract` **buildArgs**(): `object`

An abstract method to build the arguments for the configuration.
Implementations should take an object of arguments and return a potentially modified version of it.

#### Returns

`object`

The potentially modified arguments.

##### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

##### pool

> **pool**: [`IPoolData`](../interfaces/IPoolData.md)

##### referralFee

> **referralFee**: `undefined` \| [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

##### suppliedAsset

> **suppliedAsset**: `AssetAmount`\<`IAssetAmountMetadata`\>

##### swapSlippage

> **swapSlippage**: `number`

##### zapDirection

> **zapDirection**: [`EPoolCoin`](../enumerations/EPoolCoin.md)

#### Throws

If validation fails.

#### Overrides

[`OrderConfig`](OrderConfig.md).[`buildArgs`](OrderConfig.md#buildargs)

#### Defined in

[packages/core/src/Configs/ZapConfig.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/ZapConfig.class.ts#L39)

***

### setFromObject()

> `abstract` **setFromObject**(`obj`): `void`

An abstract method to set the configuration from an object.
Implementations should take an object and use it to set their own properties.

#### Parameters

• **obj**: [`IZapConfigArgs`](../interfaces/IZapConfigArgs.md)

The object from which to set the configuration.

#### Returns

`void`

#### Overrides

[`OrderConfig`](OrderConfig.md).[`setFromObject`](OrderConfig.md#setfromobject)

#### Defined in

[packages/core/src/Configs/ZapConfig.class.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/ZapConfig.class.ts#L52)

***

### setOrderAddresses()

> **setOrderAddresses**(`orderAddresses`): [`ZapConfig`](ZapConfig.md)

Set the addresses for a swap's required datum.

#### Parameters

• **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Returns

[`ZapConfig`](ZapConfig.md)

The current instance of the class.

#### Inherited from

[`OrderConfig`](OrderConfig.md).[`setOrderAddresses`](OrderConfig.md#setorderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

***

### setPool()

> **setPool**(`pool`): [`ZapConfig`](ZapConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

• **pool**: [`IPoolData`](../interfaces/IPoolData.md)

The data for the pool involved in the order.

#### Returns

[`ZapConfig`](ZapConfig.md)

The current instance of the class.

#### Inherited from

[`OrderConfig`](OrderConfig.md).[`setPool`](OrderConfig.md#setpool)

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

[`OrderConfig`](OrderConfig.md).[`setReferralFee`](OrderConfig.md#setreferralfee)

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

[`OrderConfig`](OrderConfig.md).[`validate`](OrderConfig.md#validate)

#### Defined in

[packages/core/src/Configs/ZapConfig.class.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/ZapConfig.class.ts#L68)
