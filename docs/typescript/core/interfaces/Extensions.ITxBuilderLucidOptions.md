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

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L44)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules/Core.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Inherited from

[ITxBuilderBaseOptions](Core.ITxBuilderBaseOptions.md).[wallet](Core.ITxBuilderBaseOptions.md#wallet)

#### Defined in

[@types/txbuilder.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L50)
