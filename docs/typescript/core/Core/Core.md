---
title: "Core"
---

# Core

# Introduction
The `@sundae/sdk-core` package serves as the foundation for interacting with the SundaeSwap protocol in a predictable and declarative manner,
and includes all typings and class interfaces needed to both [Get Started](#get-started) and extending the API.

## Get Started
To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:

```sh
yarn add lucid-cardano @sundae/sdk-core
```

If you plan to use this package in the browser along with Webpack 5, you'll need to add
polyfill support for Buffer. You can do this like so:

```ts
plugins: {
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"]
  })
}
```

Next, configure the instance in your app:

```ts
import { SundaeSDK } from "@sundae/sdk-core";
import {
 TxBuilderLucid,
 ProviderSundaeSwap
} from "@sundae/sdk-core/extensions";

const txBuilder = new TxBuilderLucid(
 {
     wallet: "eternl",
     network: "preview",        
     provider: "blockfrost",
     blockfrost: {
         url: "https://cardano-preview.blockfrost.io/api/v0",
         apiKey: "YOUR_API_KEY"
     }
 },
 new ProviderSundaeSwap("preview")
);

const sdk: SundaeSDK = new SundaeSDK(txBuilder);

const txHash = await sdk.swap( /** ... */ ).then(({ submit }) => submit());
```

## Index

### Enumerations

- [PoolCoin](enums/PoolCoin.md)

### Classes

- [AssetAmount](classes/AssetAmount.md)
- [CancelConfig](classes/CancelConfig.md)
- [DatumBuilder](classes/DatumBuilder.md)
- [DepositConfig](classes/DepositConfig.md)
- [SundaeSDK](classes/SundaeSDK.md)
- [SwapConfig](classes/SwapConfig.md)
- [Transaction](classes/Transaction.md)
- [WithdrawConfig](classes/WithdrawConfig.md)
- [ZapConfig](classes/ZapConfig.md)

### Exported TxBuilders

- [TxBuilder](classes/TxBuilder.md)

### Interfaces

- [Arguments](interfaces/Arguments.md)
- [CancelConfigArgs](interfaces/CancelConfigArgs.md)
- [DatumResult](interfaces/DatumResult.md)
- [DepositArguments](interfaces/DepositArguments.md)
- [DepositConfigArgs](interfaces/DepositConfigArgs.md)
- [IAsset](interfaces/IAsset.md)
- [IChainedZapArgs](interfaces/IChainedZapArgs.md)
- [IDepositArgs](interfaces/IDepositArgs.md)
- [IOrderArgs](interfaces/IOrderArgs.md)
- [IPoolData](interfaces/IPoolData.md)
- [IPoolDataAsset](interfaces/IPoolDataAsset.md)
- [IPoolQuery](interfaces/IPoolQuery.md)
- [IProtocolParams](interfaces/IProtocolParams.md)
- [ISwapArgs](interfaces/ISwapArgs.md)
- [ITxBuilderBaseOptions](interfaces/ITxBuilderBaseOptions.md)
- [ITxBuilderComplete](interfaces/ITxBuilderComplete.md)
- [ITxBuilderFees](interfaces/ITxBuilderFees.md)
- [ITxBuilderTx](interfaces/ITxBuilderTx.md)
- [IWithdrawArgs](interfaces/IWithdrawArgs.md)
- [IZapArgs](interfaces/IZapArgs.md)
- [OrderConfigArgs](interfaces/OrderConfigArgs.md)
- [SDKZapArgs](interfaces/SDKZapArgs.md)
- [SwapArguments](interfaces/SwapArguments.md)
- [SwapConfigArgs](interfaces/SwapConfigArgs.md)
- [WithdrawArguments](interfaces/WithdrawArguments.md)
- [WithdrawConfigArgs](interfaces/WithdrawConfigArgs.md)
- [ZapArguments](interfaces/ZapArguments.md)
- [ZapConfigArgs](interfaces/ZapConfigArgs.md)

### Extension Builders

- [IQueryProviderClass](interfaces/IQueryProviderClass.md)

### Type Aliases

- [CancelerAddress](types/CancelerAddress.md)
- [DatumHash](types/DatumHash.md)
- [DepositMixed](types/DepositMixed.md)
- [DepositSingle](types/DepositSingle.md)
- [DestinationAddress](types/DestinationAddress.md)
- [Ident](types/Ident.md)
- [OrderAddresses](types/OrderAddresses.md)
- [PubKeyHash](types/PubKeyHash.md)
- [Swap](types/Swap.md)
- [UTXO](types/UTXO.md)
- [Withdraw](types/Withdraw.md)

### Utility Types

- [TSupportedNetworks](types/TSupportedNetworks.md)
- [TSupportedWallets](types/TSupportedWallets.md)
