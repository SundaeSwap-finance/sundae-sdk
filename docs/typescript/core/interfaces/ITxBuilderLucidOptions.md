# Interface: ITxBuilderLucidOptions

Options interface for the [TxBuilderLucid](../classes/TxBuilderLucid.md) class.

## Hierarchy

- [`ITxBuilderOptions`](ITxBuilderOptions.md)

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

[classes/TxBuilders/TxBuilder.Lucid.class.ts:32](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L32)

___

### network

• **network**: [`TSupportedNetworks`](../modules.md#tsupportednetworks)

A supported Cardano network.

#### Inherited from

[ITxBuilderOptions](ITxBuilderOptions.md).[network](ITxBuilderOptions.md#network)

#### Defined in

[@types/txbuilder.ts:29](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L29)

___

### provider

• **provider**: ``"blockfrost"``

The provider type used by Lucid. Currently only supports Blockfrost.

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L30)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Inherited from

[ITxBuilderOptions](ITxBuilderOptions.md).[wallet](ITxBuilderOptions.md#wallet)

#### Defined in

[@types/txbuilder.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L27)
