# Class: SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within [TxBuilder.buildSwapTx](TxBuilder.md#buildswaptx).

**`Example`**

```ts
const config = new SwapConfig()
  .setPool( /** ...pool data... */)
  .setSuppliedAsset({
    assetID: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    amount: new AssetAmount(20n, 6),
  })
  .setEscrowAddress({
     DestinationAddress: {
       address: "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
     }
  });

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

[buildSwapTx](TxBuilder.md#buildswaptx)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Returns

[`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`T`\>

#### Defined in

[classes/SwapConfig.class.ts:108](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L108)

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

[classes/SwapConfig.class.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L57)

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

[classes/SwapConfig.class.ts:79](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L79)

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

[classes/SwapConfig.class.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L68)

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

[classes/SwapConfig.class.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L47)
