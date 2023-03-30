---
title: "ITxBuilderBaseOptions"
---

# ITxBuilderBaseOptions

The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
extend from this interface to ensure the wallet and network are compatible.

## Hierarchy

- [`ITxBuilderLucidOptions`](../../Extensions/interfaces/ITxBuilderLucidOptions.md)

## Properties

### network

> [`TSupportedNetworks`](../types/TSupportedNetworks.md)

A supported Cardano network.

Defined in:  [@types/txbuilder.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L50)

### wallet

> [`TSupportedWallets`](../types/TSupportedWallets.md)

A CIP-30 compatible wallet.

Defined in:  [@types/txbuilder.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L48)
