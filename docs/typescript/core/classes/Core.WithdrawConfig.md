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

- `OrderConfig`<[`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md)\>

  ↳ **`WithdrawConfig`**

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

▸ **buildArgs**(): [`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md)

Build a valid arguments object for a TxBuilder withdraw method.

#### Returns

[`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md)

#### Overrides

OrderConfig.buildArgs

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L73)

___

### setFromObject

▸ **setFromObject**(`«destructured»`): `void`

Set the default arguments from a JSON object as opposed to individually.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md) |

#### Returns

`void`

#### Overrides

OrderConfig.setFromObject

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:47](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L47)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the [OrderAddresses](../modules/Core.md#orderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) | The addresses for the order. |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setOrderAddresses

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L30)

___

### setPool

▸ **setPool**(`pool`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the pool data directly for the swap you use.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pool` | [`IPoolData`](../interfaces/Core.IPoolData.md) | The data for the pool involved in the order. |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

The current instance of the class.

#### Inherited from

OrderConfig.setPool

#### Defined in

[classes/Abstracts/OrderConfig.abstract.class.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/OrderConfig.abstract.class.ts#L41)

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

OrderConfig.setReferralFee

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L39)

___

### setSuppliedLPAsset

▸ **setSuppliedLPAsset**(`asset`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the funded asset of LP tokens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `asset` | `AssetAmount`<`IAssetAmountMetadata`\> |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L64)

___

### validate

▸ **validate**(): `void`

Validates the current config and throws an Error if any required item is not set.

#### Returns

`void`

#### Overrides

OrderConfig.validate

#### Defined in

[classes/Configs/WithdrawConfig.class.ts:86](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Configs/WithdrawConfig.class.ts#L86)
