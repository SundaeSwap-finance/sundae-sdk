# Interface: ITxBuilderBaseOptions

[Core](../modules/Core.md).ITxBuilderBaseOptions

The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
extend from this interface to ensure the wallet and network are compatible.

## Hierarchy

- **`ITxBuilderBaseOptions`**

  ↳ [`ITxBuilderLucidOptions`](Extensions.ITxBuilderLucidOptions.md)

## Properties

### debug

• `Optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Defined in

[@types/txbuilder.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L68)

___

### minLockAda

• `Optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Defined in

[@types/txbuilder.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L66)

___

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

A supported Cardano network.

#### Defined in

[@types/txbuilder.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L64)

___

### wallet

• **wallet**: [`TSupportedWallets`](../modules/Core.md#tsupportedwallets)

A CIP-30 compatible wallet.

#### Defined in

[@types/txbuilder.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L62)
