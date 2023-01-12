# @sundaeswap/sdk-core

# Introduction
The `@sundae/sdk-core` package serves as the foundation for interacting with the SundaeSwap protocol in a predictable and declarative manner,
and includes all typings and class interfaces needed to both [Get Started](#get-started) and extending the API.

## Get Started
To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:

```sh
yarn add lucid-cardano @sundae/sdk-core
```

Next, configure the instance in your app:

```ts
import {
    SundaeSDK,
    ITxBuilderClass,
    TxBuilderLucid,
    ProviderSundaeSwap
} from "@sundae/sdk-core";

const txBuilder: ITxBuilderClass = new TxBuilderLucid(
    {
        provider: "blockfrost",
        blockfrost: {
            url: "https://cardano-preview.blockfrost.io/api/v0",
            apiKey: "YOUR_API_KEY"
        }
    },
    new ProviderSundaeSwap("preview")
)

const sdk: SundaeSDK = new SundaeSDK(txBuilder);

const swap = sdk.swap( /** ... */ );
```

## Classes

- [AssetAmount](classes/AssetAmount.md)
- [SundaeSDK](classes/SundaeSDK.md)

## Extensions

- [ProviderSundaeSwap](classes/ProviderSundaeSwap.md)
- [TxBuilderLucid](classes/TxBuilderLucid.md)
- [ITxBuilderLucidOptions](interfaces/ITxBuilderLucidOptions.md)

## Interfaces

- [IAsset](interfaces/IAsset.md)
- [IBuildSwapArgs](interfaces/IBuildSwapArgs.md)
- [IPoolData](interfaces/IPoolData.md)
- [IPoolDataAsset](interfaces/IPoolDataAsset.md)
- [IPoolQuery](interfaces/IPoolQuery.md)
- [IProtocolParams](interfaces/IProtocolParams.md)
- [ISwapArgs](interfaces/ISwapArgs.md)
- [ITxBuilderComplete](interfaces/ITxBuilderComplete.md)
- [ITxBuilderOptions](interfaces/ITxBuilderOptions.md)

## Extension Builders

- [IProviderClass](interfaces/IProviderClass.md)
- [ITxBuilderClass](interfaces/ITxBuilderClass.md)

## Utility Types

### TSupportedNetworks

Ƭ **TSupportedNetworks**: ``"mainnet"`` \| ``"preview"``

A type constant used for determining valid Cardano Network values.

#### Defined in

[@types/utilities.ts:20](https://github.com/SundaeSwap-finance/sundae-sdk/blob/4629b39/packages/core/src/@types/utilities.ts#L20)

___

### TSupportedWallets

Ƭ **TSupportedWallets**: ``"nami"`` \| ``"eternl"`` \| ``"typhoncip30"`` \| ``"ccvault"`` \| ``"typhon"`` \| ``"yoroi"`` \| ``"flint"`` \| ``"gerowallet"`` \| ``"cardwallet"`` \| ``"nufi"`` \| ``"begin"``

A type constant used for determining valid CIP-30 compliant Web3 Wallets for Cardano.

#### Defined in

[@types/utilities.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/4629b39/packages/core/src/@types/utilities.ts#L27)
