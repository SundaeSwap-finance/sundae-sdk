# Sundae-SDK

[![Licence](https://img.shields.io/github/license/SundaeSwap-finance/sundae-sdk)](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/LICENSE)

Sundae-SDK is a TypeScript library for building transactions for the SundaeSwap DEX on Cardano.

> :warning: **This is a pre-release package**: until we release v1.0.0, the interface may change as we identify the optimal usage patterns.

## QuickStart

### Getting started

First, install the relevant packages:

```console
$ yarn add lucid-cardano @sundae/sdk-core
```
Then start using the SDK:
```typescript
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

### How to Use

Documentation is available at [https://sundaeswap-finance.github.io/sundae-sdk/](https://sundaeswap-finance.github.io/sundae-sdk/), but it is very much a work-in-progress. Feel free to open a discussion with feedback, or submit a pull request!

# Contributing

Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md) to know how.
