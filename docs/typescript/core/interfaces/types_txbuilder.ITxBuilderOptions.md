[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [@types/txbuilder](../modules/types_txbuilder.md) / ITxBuilderOptions

# Interface: ITxBuilderOptions

[@types/txbuilder](../modules/types_txbuilder.md).ITxBuilderOptions

The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
extend from this interface to ensure the wallet and network are compatible.

## Hierarchy

- **`ITxBuilderOptions`**

  ↳ [`ITxBuilderLucidOptions`](types_txbuilder.ITxBuilderLucidOptions.md)

## Properties

### network

• **network**: [`TSupportedNetworks`](../modules/types.md#tsupportednetworks)

A supported Cardano network.

#### Defined in

@types/txbuilder.d.ts:19

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules/types.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Defined in

@types/txbuilder.d.ts:17
