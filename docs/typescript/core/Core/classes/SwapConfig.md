[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within [Core.TxBuilderV1](TxBuilderV1.md) or [Core.TxBuilderV3](TxBuilderV3.md).

## Example

```ts
const config = new SwapConfig()
  .setPool( /** ...pool data... */)
  .setSuppliedAsset({
    assetId: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    amount: new AssetAmount(20n, 6),
  })
  .setOrderAddresses({
     DestinationAddress: {
       address: "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
     }
  });

const { submit, cbor } = await SDK.swap(config);
```

## Extends

- [`OrderConfig`](OrderConfig.md)\<`Omit`\<[`ISwapConfigArgs`](../interfaces/ISwapConfigArgs.md), `"swapType"`\> & `object`\>

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

[packages/core/src/Abstracts/Config.abstract.class.ts:15](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L15)

## Methods

### buildArgs()

> **buildArgs**(): `object`

Used for building a swap where you already know the pool data.
Useful for when building Transactions directly from the builder instance.

#### Returns

`object`

##### minReceivable

> **minReceivable**: `AssetAmount`\<`IAssetAmountMetadata`\>

##### orderAddresses

> **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

##### pool

> **pool**: [`IPoolData`](../interfaces/IPoolData.md)

##### referralFee

> **referralFee**: `undefined` \| [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

##### suppliedAsset

> **suppliedAsset**: `AssetAmount`\<`IAssetAmountMetadata`\>

#### See

[Core.TxBuilderV1](TxBuilderV1.md) or [Core.TxBuilderV3](TxBuilderV3.md)

#### Overrides

[`OrderConfig`](OrderConfig.md).[`buildArgs`](OrderConfig.md#buildargs)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L77)

***

### setFromObject()

> **setFromObject**(`__namedParameters`): `void`

Helper function to build valid swap arguments from a JSON object.

#### Parameters

• **\_\_namedParameters**: [`ISwapConfigArgs`](../interfaces/ISwapConfigArgs.md)

#### Returns

`void`

#### Overrides

[`OrderConfig`](OrderConfig.md).[`setFromObject`](OrderConfig.md#setfromobject)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L91)

***

### setMinReceivable()

> **setMinReceivable**(`amount`): [`SwapConfig`](SwapConfig.md)

Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.

#### Parameters

• **amount**: `AssetAmount`\<`IAssetAmountMetadata`\>

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L64)

***

### setOrderAddresses()

> **setOrderAddresses**(`orderAddresses`): [`SwapConfig`](SwapConfig.md)

Set the addresses for a swap's required datum.

#### Parameters

• **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Returns

[`SwapConfig`](SwapConfig.md)

The current instance of the class.

#### Inherited from

[`OrderConfig`](OrderConfig.md).[`setOrderAddresses`](OrderConfig.md#setorderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

***

### setPool()

> **setPool**(`pool`): [`SwapConfig`](SwapConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

• **pool**: [`IPoolData`](../interfaces/IPoolData.md)

The data for the pool involved in the order.

#### Returns

[`SwapConfig`](SwapConfig.md)

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

[packages/core/src/Abstracts/Config.abstract.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L39)

***

### setSuppliedAsset()

> **setSuppliedAsset**(`asset`): [`SwapConfig`](SwapConfig.md)

Set the supplied asset for the swap.

#### Parameters

• **asset**: `AssetAmount`\<`IAssetAmountMetadata`\>

The provided asset and amount from a connected wallet.

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:53](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L53)

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

[packages/core/src/Configs/SwapConfig.class.ts:121](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L121)
