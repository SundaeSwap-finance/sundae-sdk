---
"@sundaeswap/core": minor
"@sundaeswap/math": minor
---

Constant-sum and concentrated-liquidity pool math, and two new ways to place v4
orders.

`ConstantSumPool` and `ConcentratedLiquidityPool` cover swap output, reverse
swap (input for a wanted output), and deposits. Deposits are target-pinned the
way the chain resolves them — capped by the scarcest offered asset rather than
by the plain value sum, which matches only exactly proportional offers and
otherwise mints less than it predicts.

`TxBuilderV4.blendedSwap` places a complex swap as a basic order, so a trade
that spans several of a pair's pools stays one pool-agnostic intent.
`TxBuilderV4.batch` places several basic orders in one transaction, for intents
that are irreducibly plural — depositing across every concentrated-liquidity
pool a price range touches is several orders because it is several pools, and
one signature per pool leaves a half-built position.

Also: `SundaeUtils.isLPAsset` recognizes v4 LP assets, and v4 validator titles
follow the dotted convention used by V1/V3.
