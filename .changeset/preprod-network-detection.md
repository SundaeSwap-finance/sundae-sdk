---
"@sundaeswap/core": minor
"@sundaeswap/cli": patch
"@sundaeswap/yield-farming": patch
---

Add preprod network support with automatic network detection from Blaze provider.

**Features:**
- Added `SundaeUtils.getNetworkFromProvider()` to convert Blaze's `NetworkName` to SDK's `TSupportedNetworks`
- Preprod network support for core SDK network detection, query providers, and V3/Stableswaps TxBuilders
- Added `network` property on `SundaeSDK` class for easy access to the detected network
- Network is automatically detected from `blazeInstance.provider.networkName` - correctly distinguishes mainnet, preview, and preprod

**Note:** V1 TxBuilder and YieldFarming features are not supported on preprod.

**Fixes:**
- Fixed circular dependency in TxBuilders by converting static SundaeSDK imports to dynamic imports
