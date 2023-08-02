# Interface: ITxBuilderLucidOptions

[Extensions](../modules/Extensions.md).ITxBuilderLucidOptions

Options interface for the [TxBuilderLucid](../classes/Extensions.TxBuilderLucid.md) class.

## Hierarchy

- [`ITxBuilderBaseOptions`](Core.ITxBuilderBaseOptions.md)

  ↳ **`ITxBuilderLucidOptions`**

## Properties

### blockfrost

• `Optional` **blockfrost**: `Object`

The chosen provider options object to pass to Lucid.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `apiKey` | `string` |
| `url` | `string` |

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L45)

___

### debug

• `Optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[debug](Core.ITxBuilderBaseOptions.md#debug)

#### Defined in

[@types/txbuilder.ts:56](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L56)

___

### minLockAda

• `Optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[minLockAda](Core.ITxBuilderBaseOptions.md#minlockada)

#### Defined in

[@types/txbuilder.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L54)

___

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

A supported Cardano network.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[network](Core.ITxBuilderBaseOptions.md#network)

#### Defined in

[@types/txbuilder.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L52)

___

### providerType

• `Optional` **providerType**: ``"blockfrost"``

The provider type used by Lucid. Currently only supports Blockfrost.

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L43)

___

### referral

• `Optional` **referral**: [`ITxBuilderReferralFee`](Core.ITxBuilderReferralFee.md)

Whether transactions should always include a referral fee.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[referral](Core.ITxBuilderBaseOptions.md#referral)

#### Defined in

[@types/txbuilder.ts:58](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L58)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules/Core.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[wallet](Core.ITxBuilderBaseOptions.md#wallet)

#### Defined in

[@types/txbuilder.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L50)
