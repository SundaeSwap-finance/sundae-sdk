# Class: SwapConfig

[Core](../modules/Core.md).SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within [TxBuilder.buildSwapTx](Core.TxBuilder.md#buildswaptx).

**`Example`**

```ts
const config = new SwapConfig()
  .setPool( /** ...pool data... */)
  .setSuppliedAsset({
    assetID: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
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

- `Config`<[`ISwapArgs`](../interfaces/Core.ISwapArgs.md)\>

  ↳ **`SwapConfig`**

## Methods

### buildArgs

▸ **buildArgs**(): [`ISwapArgs`](../interfaces/Core.ISwapArgs.md)

Used for building a swap where you already know the pool data.
Useful for when building Transactions directly from the builder instance.

**`See`**

[buildSwapTx](Core.TxBuilder.md#buildswaptx)

#### Returns

[`ISwapArgs`](../interfaces/Core.ISwapArgs.md)

#### Overrides

Config.buildArgs

#### Defined in

[classes/Configs/SwapConfig.class.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L75)

___

### setFromObject

▸ **setFromObject**(`«destructured»`): `void`

Helper function to build valid swap arguments from a JSON object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`BuildSwapConfigArgs`](../interfaces/Core.BuildSwapConfigArgs.md) |

#### Returns

`void`

#### Overrides

Config.setFromObject

#### Defined in

[classes/Configs/SwapConfig.class.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L89)

___

### setMinReceivable

▸ **setMinReceivable**(`amount`): [`SwapConfig`](Core.SwapConfig.md)

Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | [`AssetAmount`](Core.AssetAmount.md) |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Defined in

[classes/Configs/SwapConfig.class.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L62)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`SwapConfig`](Core.SwapConfig.md)

Builds the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Inherited from

Config.setOrderAddresses

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L14)

___

### setPool

▸ **setPool**(`pool`): [`SwapConfig`](Core.SwapConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) |

#### Returns

[`SwapConfig`](Core.SwapConfig.md)

#### Inherited from

Config.setPool

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L25)

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

[classes/Configs/SwapConfig.class.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L51)
