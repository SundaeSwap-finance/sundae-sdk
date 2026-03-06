---
"@sundaeswap/core": minor
"@sundaeswap/yield-farming": minor
---

Add preprod network support

- Add "preprod" to TSupportedNetworks
- Add preprod endpoints for QueryProviderSundaeSwap and QueryProviderSundaeSwapLegacy
- Add preprod entry to TxBuilder.V1 PARAMS and YF_V2_PARAMS (throws at runtime since V1/YF are not deployed on preprod)
- Add preprod entry to YieldFarmingBuilder PARAMS (throws at runtime)
