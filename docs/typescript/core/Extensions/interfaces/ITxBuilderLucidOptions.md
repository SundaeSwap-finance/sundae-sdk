---
title: "ITxBuilderLucidOptions"
---

# ITxBuilderLucidOptions

Options interface for the [TxBuilderLucid](../classes/TxBuilderLucid.md) class.

## Hierarchy

- [`ITxBuilderBaseOptions`](../../Core/interfaces/ITxBuilderBaseOptions.md).**ITxBuilderLucidOptions**

## Properties

### blockfrost?

> `object`

```ts
{
    apiKey: string;
    url: string;
}
```

The chosen provider options object to pass to Lucid.

#### Type declaration

| Member | Type |
| :------ | :------ |
| `apiKey` | `string` |
| `url` | `string` |

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L42)

### network

> [`TSupportedNetworks`](../../Core/types/TSupportedNetworks.md)

A supported Cardano network.

Inherited from: [ITxBuilderBaseOptions](../../Core/interfaces/ITxBuilderBaseOptions.md).[network](../../Core/interfaces/ITxBuilderBaseOptions.md#network)

Defined in:  [@types/txbuilder.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L50)

### providerType?

> `"blockfrost"`

The provider type used by Lucid. Currently only supports Blockfrost.

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L40)

### wallet

> [`TSupportedWallets`](../../Core/types/TSupportedWallets.md)

A CIP-30 compatible wallet.

Inherited from: [ITxBuilderBaseOptions](../../Core/interfaces/ITxBuilderBaseOptions.md).[wallet](../../Core/interfaces/ITxBuilderBaseOptions.md#wallet)

Defined in:  [@types/txbuilder.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L48)
