---
"@sundaeswap/math": minor
"@sundaeswap/core": minor
---

Banded concentrated liquidity.

`@sundaeswap/math` gains `BandedConcentratedLiquidityPool`: the ladder math of
sundae-v4's banded module (index, witness search, multi-band swap output,
per-band state, ladder builders), checked against the on-chain vectors.

`@sundaeswap/core` reads a pool's ladder (`bands`, `bandClosing`,
`activeBand`, `bandCounter`, `bandWeightTotal`) from the API, quotes banded
pools in `SundaeUtils.getSwapOutput` / `calculateLiquidity`, builds the
banded module's config and Create redeemer (`DatumBuilderV4`), mints banded
pools with or without the oracle module (`TxBuilderV4.mintPool`), and places
liquidity movements between pools as one order (`TxBuilderV4.moveLiquidity`).
