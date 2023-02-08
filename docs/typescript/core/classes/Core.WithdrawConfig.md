# Class: WithdrawConfig

[Core](../modules/Core.md).WithdrawConfig

The `WithdrawConfig` class helps to properly format your withdraw arguments for use within [TxBuilder.buildWithdrawTx](Core.TxBuilder.md#buildwithdrawtx).

**`Example`**

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

**`See`**

[withdraw](Core.SundaeSDK.md#withdraw)

## Hierarchy

- `Config`

  ↳ **`WithdrawConfig`**

## Methods

### buildArgs

▸ **buildArgs**(): [`IWithdrawArgs`](../interfaces/Core.IWithdrawArgs.md)

Build a valid arguments object for a TxBuilder withdraw method.

#### Returns

[`IWithdrawArgs`](../interfaces/Core.IWithdrawArgs.md)

#### Overrides

Config.buildArgs

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L69)

___

### setFromObject

▸ **setFromObject**(`«destructured»`): `void`

Set the default arguments from a JSON object as opposed to individually.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`BuildWithdrawConfigArgs`](../interfaces/Core.BuildWithdrawConfigArgs.md) |

#### Returns

`void`

#### Overrides

Config.setFromObject

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L45)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Builds the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

#### Inherited from

Config.setOrderAddresses

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L14)

___

### setPool

▸ **setPool**(`pool`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

#### Inherited from

Config.setPool

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:25](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L25)

___

### setSuppliedLPAsset

▸ **setSuppliedLPAsset**(`asset`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the funded asset of LP tokens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `asset` | [`IAsset`](../interfaces/Core.IAsset.md) |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L60)

___

### validate

▸ **validate**(): `void`

Validates the current config and throws an Error if any required item is not set.

#### Returns

`void`

#### Overrides

Config.validate

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L80)
