---
"@sundaeswap/core": minor
---

Add SundaeUtils.getSwapInput with version branching for stableswaps

This method calculates the required input amount for a desired output, similar to getSwapOutput but in reverse. It correctly handles both constant product pools (V1, V3, NftCheck) and stableswaps pools by using the appropriate math for each pool type.

For stableswaps, it uses linearAmplificationFactor and protocolFee parameters instead of defaulting to constant product math.
