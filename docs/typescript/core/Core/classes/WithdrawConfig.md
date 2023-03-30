---
title: "WithdrawConfig"
---

# WithdrawConfig

The `WithdrawConfig` class helps to properly format your withdraw arguments for use within [TxBuilder.buildWithdrawTx](TxBuilder.md#buildwithdrawtx).

## Example

```ts
const config = new WithdrawConfig()
  .setPool( /** ...pool data... */)
  .setSuppliedLPAsset({
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

[withdraw](SundaeSDK.md#withdraw)

## Hierarchy

- `Config`.**WithdrawConfig**

## Methods

### buildArgs()

Build a valid arguments object for a TxBuilder withdraw method.

#### Signature

```ts
buildArgs(): IWithdrawArgs;
```

#### Returns

[`IWithdrawArgs`](../interfaces/IWithdrawArgs.md)

Overrides: Config.buildArgs

Defined in:  [classes/Configs/WithdrawConfig.class.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L69)

### setFromObject()

Set the default arguments from a JSON object as opposed to individually.

#### Signature

```ts
setFromObject(«destructured»: WithdrawConfigArgs): void;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`WithdrawConfigArgs`](../interfaces/WithdrawConfigArgs.md) |

#### Returns

`void`

Overrides: Config.setFromObject

Defined in:  [classes/Configs/WithdrawConfig.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L45)

### setOrderAddresses()

Builds the [OrderAddresses](../types/OrderAddresses.md) for a swap's required datum.

#### Signature

```ts
setOrderAddresses(orderAddresses: OrderAddresses): WithdrawConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../types/OrderAddresses.md) |

#### Returns

[`WithdrawConfig`](WithdrawConfig.md)

Inherited from: Config.setOrderAddresses

Defined in:  [classes/Abstracts/Config.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L14)

### setPool()

Set the pool data directly for the swap you use.

#### Signature

```ts
setPool(pool: IPoolData): WithdrawConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/IPoolData.md) |

#### Returns

[`WithdrawConfig`](WithdrawConfig.md)

Inherited from: Config.setPool

Defined in:  [classes/Abstracts/Config.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L25)

### setSuppliedLPAsset()

Set the funded asset of LP tokens.

#### Signature

```ts
setSuppliedLPAsset(asset: IAsset): WithdrawConfig;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `asset` | [`IAsset`](../interfaces/IAsset.md) |

#### Returns

[`WithdrawConfig`](WithdrawConfig.md)

Defined in:  [classes/Configs/WithdrawConfig.class.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L60)

### validate()

Validates the current config and throws an Error if any required item is not set.

#### Signature

```ts
validate(): void;
```

#### Returns

`void`

Overrides: Config.validate

Defined in:  [classes/Configs/WithdrawConfig.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L80)
