# Class: WithdrawConfig

[Core](../modules/Core.md).WithdrawConfig

The `WithdrawConfig` class helps to properly format your withdraw arguments for use within [Core.TxBuilder](Core.TxBuilder.md).

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

## Hierarchy

- [`OrderConfig`](Core.OrderConfig.md)\<[`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md)\>

  ↳ **`WithdrawConfig`**

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

▸ **buildArgs**(): [`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md)

Build a valid arguments object for a TxBuilder withdraw method.

#### Returns

[`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md)

#### Overrides

[OrderConfig](Core.OrderConfig.md).[buildArgs](Core.OrderConfig.md#buildargs)

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L69)

___

### setFromObject

▸ **setFromObject**(`«destructured»`): `void`

Set the default arguments from a JSON object as opposed to individually.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md) |

#### Returns

`void`

#### Overrides

[OrderConfig](Core.OrderConfig.md).[setFromObject](Core.OrderConfig.md#setfromobject)

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L43)

___

### setOrderAddresses

▸ **setOrderAddresses**(`orderAddresses`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the [Core.TOrderAddresses](../modules/Core.md#torderaddresses) for a swap's required datum.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `orderAddresses` | [`TOrderAddresses`](../modules/Core.md#torderaddresses) | The addresses for the order. |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

The current instance of the class.

#### Inherited from

[OrderConfig](Core.OrderConfig.md).[setOrderAddresses](Core.OrderConfig.md#setorderaddresses)

#### Defined in

[packages/core/src/Abstracts/OrderConfig.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/OrderConfig.abstract.class.ts#L26)

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

### setSuppliedLPAsset

▸ **setSuppliedLPAsset**(`asset`): [`WithdrawConfig`](Core.WithdrawConfig.md)

Set the funded asset of LP tokens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `asset` | `AssetAmount`\<`IAssetAmountMetadata`\> |

#### Returns

[`WithdrawConfig`](Core.WithdrawConfig.md)

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L60)

___

### validate

▸ **validate**(): `void`

Validates the current config and throws an Error if any required item is not set.

#### Returns

`void`

#### Overrides

[OrderConfig](Core.OrderConfig.md).[validate](Core.OrderConfig.md#validate)

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:82](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L82)
