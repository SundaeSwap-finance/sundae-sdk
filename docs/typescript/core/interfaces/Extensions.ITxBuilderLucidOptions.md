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

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L46)

___

### debug

• `Optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[debug](Core.ITxBuilderBaseOptions.md#debug)

#### Defined in

[@types/txbuilder.ts:61](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L61)

___

### minLockAda

• `Optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[minLockAda](Core.ITxBuilderBaseOptions.md#minlockada)

#### Defined in

[@types/txbuilder.ts:59](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L59)

___

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

A supported Cardano network.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[network](Core.ITxBuilderBaseOptions.md#network)

#### Defined in

[@types/txbuilder.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L57)

___

### providerType

• `Optional` **providerType**: ``"blockfrost"``

The provider type used by Lucid. Currently only supports Blockfrost.

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L44)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules/Core.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[wallet](Core.ITxBuilderBaseOptions.md#wallet)

#### Defined in

[@types/txbuilder.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L55)
