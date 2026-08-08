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

`TxBuilderV4.swapIntent` places a v4 swap: an offer and a floor, naming no
pool, which the scooper fills across one pool, several, or a chain.
`TxBuilderV4.swap` now throws — swap orders carry the route constraint, which
is outside the audited launch surface, and the name is kept so an integrator
reaching for it is told what to use instead. Updating an order to a route order
is gone from the type for the same reason.
`TxBuilderV4.batch` places several basic orders in one transaction, for intents
that are irreducibly plural — depositing across every concentrated-liquidity
pool a price range touches is several orders because it is several pools, and
one signature per pool leaves a half-built position.

Also: `SundaeUtils.isLPAsset` recognizes v4 LP assets, and v4 validator titles
follow the dotted convention used by V1/V3. New `SundaeUtils.resolveLPVersion`
answers "which version minted this LP?" the only way it can be answered — by
comparing the asset's policy id against each version's `pool.mint` hash —
and `getPoolVersionFromAssetId` is deprecated: an asset name is a naming
convention shared by V3, Stableswaps, V4 and every future version, so it
cannot carry a version.
