# Class: SwapConfig

[Core](../modules/Core.md).SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within [Core.TxBuilder](Core.TxBuilder.md).

**`Example`**

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

## Hierarchy

- [`OrderConfig`](Core.OrderConfig.md)\<`Omit`\<[`ISwapConfigArgs`](../interfaces/Core.ISwapConfigArgs.md), ``"swapType"``\> & \{ `minReceivable`: `AssetAmount`\<`IAssetAmountMetadata`\>  }\>

  ↳ **`SwapConfig`**

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

### buildArgs

▸ **buildArgs**(): `Object`

Used for building a swap where you already know the pool data.
Useful for when building Transactions directly from the builder instance.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `minReceivable` | `AssetAmount`\<`IAssetAmountMetadata`\> |
| `orderAddresses` | [`TOrderAddresses`](../modules/Core.md#torderaddresses) |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) |
| `referralFee` | `undefined` \| [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) |
| `suppliedAsset` | `AssetAmount`\<`IAssetAmountMetadata`\> |

**`See`**

[Core.TxBuilder](Core.TxBuilder.md)

#### Overrides

[OrderConfig](Core.OrderConfig.md).[buildArgs](Core.OrderConfig.md#buildargs)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L77)

___

### setFromObject

▸ **setFromObject**(`«destructured»`): `void`

Helper function to build valid swap arguments from a JSON object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ISwapConfigArgs`](../interfaces/Core.ISwapConfigArgs.md) |

#### Returns

`void`

#### Overrides

[OrderConfig](Core.OrderConfig.md).[setFromObject](Core.OrderConfig.md#setfromobject)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L91)

___

### setMinReceivable

▸ **setMinReceivable**(`amount`): [`SwapConfig`](Core.SwapConfig.md)

Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `AssetAmount`\<`IAssetAmountMetadata`\> |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L64)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`SwapConfig`](Core.SwapConfig.md)

Set the [Core.TOrderAddresses](../modules/Core.md#torderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`TOrderAddresses`](../modules/Core.md#torderaddresses) | The addresses for the order. |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

The current instance of the class.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[setOrderAddresses](Core.OrderConfig.md#setorderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

___

### setPool

▸ **setPool**(`pool`): [`SwapConfig`](Core.SwapConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) | The data for the pool involved in the order. |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

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

___

### setSuppliedAsset

▸ **setSuppliedAsset**(`asset`): [`SwapConfig`](Core.SwapConfig.md)

Set the supplied asset for the swap.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | `AssetAmount`\<`IAssetAmountMetadata`\> | The provided asset and amount from a connected wallet. |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Defined in

[packages/core/src/Configs/SwapConfig.class.ts:53](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/SwapConfig.class.ts#L53)
