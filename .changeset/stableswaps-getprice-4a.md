---
"@sundaeswap/math": patch
---

Fix `StableSwapsPool.getPrice` to use the 4A amplification term of the on-chain Stableswaps invariant. Off par, the spot price was about twice as far from 1 as the curve's real marginal price, which overstated `priceImpact` for Stableswaps swaps and skewed `SundaeUtils.getPrice` for Stableswaps pools. The docstring now states the returned orientation: raw A per raw B.
