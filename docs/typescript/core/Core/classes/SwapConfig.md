---
title: "SwapConfig"
---

# SwapConfig

The `SwapConfig` class helps to properly format your swap arguments for use within [TxBuilder.buildSwapTx](TxBuilder.md#buildswaptx).

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

## See

[swap](SundaeSDK.md#swap)

## Hierarchy

- `Config`\<[`SwapConfigArgs`](../interfaces/SwapConfigArgs.md)\>.**SwapConfig**

## Methods

### buildArgs()

Used for building a swap where you already know the pool data.
Useful for when building Transactions directly from the builder instance.

#### See

[buildSwapTx](TxBuilder.md#buildswaptx)

#### Signature

```ts
buildArgs(): SwapConfigArgs;
```

#### Returns

[`SwapConfigArgs`](../interfaces/SwapConfigArgs.md)

Overrides: Config.buildArgs

Defined in:  [classes/Configs/SwapConfig.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L74)

### setFromObject()

Helper function to build valid swap arguments from a JSON object.

#### Signature

```ts
setFromObject(«destructured»: SwapConfigArgs): void;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SwapConfigArgs`](../interfaces/SwapConfigArgs.md) |

#### Returns

`void`

Overrides: Config.setFromObject

Defined in:  [classes/Configs/SwapConfig.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L87)

### setMinReceivable()

Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.

#### Signature

```ts
setMinReceivable(amount: AssetAmount): SwapConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | [`AssetAmount`](AssetAmount.md) |

#### Returns

[`SwapConfig`](SwapConfig.md)

Defined in:  [classes/Configs/SwapConfig.class.ts:61](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L61)

### setOrderAddresses()

Builds the [OrderAddresses](../types/OrderAddresses.md) for a swap's required datum.

#### Signature

```ts
setOrderAddresses(orderAddresses: OrderAddresses): SwapConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../types/OrderAddresses.md) |

#### Returns

[`SwapConfig`](SwapConfig.md)

Inherited from: Config.setOrderAddresses

Defined in:  [classes/Abstracts/Config.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L14)

### setPool()

Set the pool data directly for the swap you use.

#### Signature

```ts
setPool(pool: IPoolData): SwapConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/IPoolData.md) |

#### Returns

[`SwapConfig`](SwapConfig.md)

Inherited from: Config.setPool

Defined in:  [classes/Abstracts/Config.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L25)

### setSuppliedAsset()

Set the supplied asset for the swap.

#### Signature

```ts
setSuppliedAsset(asset: IAsset): SwapConfig;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`IAsset`](../interfaces/IAsset.md) | The provided asset and amount from a connected wallet. |

#### Returns

[`SwapConfig`](SwapConfig.md)

Defined in:  [classes/Configs/SwapConfig.class.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/SwapConfig.class.ts#L50)
