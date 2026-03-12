---
"@sundaeswap/core": minor
"@sundaeswap/cli": patch
"@sundaeswap/yield-farming": patch
---

Add preprod network support with automatic network detection from Blaze provider.

**Features:**
- Added `SundaeUtils.getNetworkFromProvider()` to convert Blaze's `NetworkName` to SDK's `TSupportedNetworks`
- Full preprod network support across all TxBuilders and YieldFarmingBuilder
- Added `network` property on `SundaeSDK` class for easy access to the detected network
- Network is automatically detected from `blazeInstance.provider.networkName` - correctly distinguishes mainnet, preview, and preprod

**Fixes:**
- Fixed circular dependency in TxBuilders by converting static SundaeSDK imports to dynamic imports
