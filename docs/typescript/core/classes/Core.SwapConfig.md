# Class: SwapConfig

[Core](../modules/Core.md).SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within [TxBuilder.buildSwapTx](Core.TxBuilder.md#buildswaptx).

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

**`See`**

[swap](Core.SundaeSDK.md#swap)

## Hierarchy

- `OrderConfig`<[`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md)\>

  ↳ **`SwapConfig`**

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

### buildArgs

▸ **buildArgs**(): [`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md)

Used for building a swap where you already know the pool data.
Useful for when building Transactions directly from the builder instance.

**`See`**

[buildSwapTx](Core.TxBuilder.md#buildswaptx)

#### Returns

[`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md)

#### Overrides

OrderConfig.buildArgs

#### Defined in

[classes/Configs/SwapConfig.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L74)

___

### setFromObject

▸ **setFromObject**(`«destructured»`): `void`

Helper function to build valid swap arguments from a JSON object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md) |

#### Returns

`void`

#### Overrides

OrderConfig.setFromObject

#### Defined in

[classes/Configs/SwapConfig.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L87)

___

### setMinReceivable

▸ **setMinReceivable**(`amount`): [`SwapConfig`](Core.SwapConfig.md)

Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `AssetAmount`<`any`\> |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Defined in

[classes/Configs/SwapConfig.class.ts:61](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L61)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`SwapConfig`](Core.SwapConfig.md)

Set the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) | The addresses for the order. |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setOrderAddresses

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L30)

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

OrderConfig.setPool

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L41)

___

### setSuppliedAsset

▸ **setSuppliedAsset**(`asset`): [`SwapConfig`](Core.SwapConfig.md)

Set the supplied asset for the swap.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`IAsset`](../interfaces/Core.IAsset.md) | The provided asset and amount from a connected wallet. |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Defined in

[classes/Configs/SwapConfig.class.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L50)
