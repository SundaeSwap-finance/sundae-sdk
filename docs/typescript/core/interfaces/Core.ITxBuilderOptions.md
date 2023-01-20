# Interface: ITxBuilderOptions

[Core](../modules/Core.md).ITxBuilderOptions

The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
extend from this interface to ensure the wallet and network are compatible.

## Hierarchy

- **`ITxBuilderOptions`**

  ↳ [`ITxBuilderLucidOptions`](Extensions.ITxBuilderLucidOptions.md)

## Properties

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

A supported Cardano network.

#### Defined in

[@types/txbuilder.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L28)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules/Core.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Defined in

[@types/txbuilder.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L26)
