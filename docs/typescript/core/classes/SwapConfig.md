# Class: SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within ITxBuilderClass.buildSwap | ITxBuilderClass.buildSwap.

**`Example`**

```ts
const config = new SwapConfig()
  .setPool( /** ...pool data... */)
  .setFunding({
    assetID: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    amount: new AssetAmount(20n, 6),
  })
  .setReceiverAddress(
    "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
  );

const { submit, cbor } = await SDK.swap(config);
```

**`See`**

[swap](SundaeSDK.md#swap)

## Methods

### buildSwapArgs

▸ **buildSwapArgs**<`T`\>(): [`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`T`\>

Used for building a swap where you already know the pool data.
Useful for when building Transactions directly from the builder instance.

**`See`**

ITxBuilderClass.buildSwap

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Returns

[`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`T`\>

#### Defined in

[classes/SwapConfig.class.ts:106](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L106)

___

### setEscrowAddress

▸ **setEscrowAddress**(`escrowAddress`): [`SwapConfig`](SwapConfig.md)

Builds the [EscrowAddress](../modules.md#escrowaddress) for a swap's required datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `escrowAddress` | [`EscrowAddress`](../modules.md#escrowaddress) |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L55)

___

### setMinReceivable

▸ **setMinReceivable**(`amount`): [`SwapConfig`](SwapConfig.md)

Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | [`AssetAmount`](AssetAmount.md) |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L77)

___

### setPool

▸ **setPool**(`pool`): [`SwapConfig`](SwapConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/IPoolData.md) |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L66)

___

### setSuppliedAsset

▸ **setSuppliedAsset**(`asset`): [`SwapConfig`](SwapConfig.md)

Set the supplied asset for the swap.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`IAsset`](../interfaces/IAsset.md) | The provided asset and amount from a connected wallet. |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L45)
