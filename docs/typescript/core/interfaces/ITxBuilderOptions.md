# Interface: ITxBuilderOptions

The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
extend from this interface to ensure the wallet and network are compatible.

## Hierarchy

- **`ITxBuilderOptions`**

  ↳ [`ITxBuilderLucidOptions`](ITxBuilderLucidOptions.md)

## Properties

### network

• **network**: [`TSupportedNetworks`](../modules.md#tsupportednetworks)

A supported Cardano network.

#### Defined in

[@types/txbuilder.ts:22](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L22)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Defined in

[@types/txbuilder.ts:20](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L20)
