# Class: SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within the [SundaeSDK](SundaeSDK.md).

**`Example`**

```ts
const config = new SwapConfig()
  .setPoolQuery(poolQuery)
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

### buildRawSwap

▸ **buildRawSwap**(): [`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)

Used for building a swap where you **do** know the pool data.
Useful for when building Transactions directly from the builder instance.

**`See`**

[buildSwap](../interfaces/ITxBuilderClass.md#buildswap)

#### Returns

[`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)

#### Defined in

[classes/SwapConfig.class.ts:123](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L123)

___

### buildSwap

▸ **buildSwap**(): [`ISwapArgs`](../interfaces/ISwapArgs.md)

Used for building a swap where you don't know the pool data.

**`See`**

[swap](SundaeSDK.md#swap)

#### Returns

[`ISwapArgs`](../interfaces/ISwapArgs.md)

#### Defined in

[classes/SwapConfig.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L107)

___

### setFunding

▸ **setFunding**(`asset`): [`SwapConfig`](SwapConfig.md)

Set the funding for the swap.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`IAsset`](../interfaces/IAsset.md) | The provided asset and amount from a connected wallet. |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L46)

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

[classes/SwapConfig.class.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L57)

___

### setPoolQuery

▸ **setPoolQuery**(`poolQuery`): [`SwapConfig`](SwapConfig.md)

Set the pool query. Used when passing to [swap](SundaeSDK.md#swap).

#### Parameters

| Name | Type |
| :------ | :------ |
| `poolQuery` | [`IPoolQuery`](../interfaces/IPoolQuery.md) |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L68)

___

### setReceiverAddress

▸ **setReceiverAddress**(`addr`): [`SwapConfig`](SwapConfig.md)

Set where the pool's other asset should be sent to after a successful scoop.

#### Parameters

| Name | Type |
| :------ | :------ |
| `addr` | `string` |

#### Returns

[`SwapConfig`](SwapConfig.md)

#### Defined in

[classes/SwapConfig.class.ts:79](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SwapConfig.class.ts#L79)
