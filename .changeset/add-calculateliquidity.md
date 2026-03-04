---
"@sundaeswap/core": minor
---

Add SundaeUtils.calculateLiquidity with version branching for stableswaps

This method calculates liquidity provision parameters (LP tokens generated, pool share, actual deposits) by branching to the appropriate pool math based on contract version. Supports constant product pools (V1, V3, NftCheck) and stableswaps pools.
