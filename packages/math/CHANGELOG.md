# @sundaeswap/math

## 0.4.0

### Minor Changes

- 571cb48: v4 stableswap pool math.

  `EPoolCurve.V4Stableswap` is the v4 stableswap invariant module: a Curve-style
  two-asset curve for pegged pairs. It is NOT `EContractVersion.Stableswaps`,
  which is the v3 stableswap contract. The two share a curve shape and nothing
  else, so the estimator is a separate module, `V4StableswapPool`, and the pool
  data fields are separate too.

  `V4StableswapPool` covers the sum invariant `D`, swap output, reverse swap
  (input for a wanted output), the curve's marginal price, and target-pinned
  deposits. `D` and the swap output both need Newton's method, so the module
  reproduces the scooper's solvers and their integer rounding rather than
  approximating them. The fee comes off the gross output, not the input, so
  `lpFee` is denominated in the output asset.

  `IPoolData` gains `rates`, the per-asset integer rates aligned to
  `[assetA, assetB]`. The amplification the curve also needs is the existing
  `linearAmplificationFactor`: one parameter, one field, both versions, on one
  scale. Each implementation applies its own internal scaling.

  `QueryProviderSundaeSwap` now selects and maps the v4 curve config — `modules`
  (which names the curve), `prices`, `sqrtPrices` and `rates` — on every pool
  query, minimal ones included. It selected none of them before, so a v4 pool
  fetched through the standard provider arrived with no curve and could not be
  quoted at all. That applied to constant sum and concentrated liquidity as much
  as to stableswap.

  `SundaeUtils.getSwapOutput`, `getSwapInput`, `calculateLiquidity` and `getPrice`
  all dispatch the new curve. `getPrice` takes the curve's marginal price at the
  current reserves, because a stableswap pool's price moves with its reserves —
  unlike constant sum, whose price is fixed.

## 0.3.0

### Minor Changes

- 13b0ffd: Constant-sum and concentrated-liquidity pool math, and two new ways to place v4
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

## 0.2.2

### Patch Changes

- 4b5718b: Attempts to remove double publish scripts

## 0.2.1

### Patch Changes

- 78a3a40: Fixes publish scripts so that they can be run with lerna and in order of their deps.

## 0.2.0

### Minor Changes

- 17f73cc: Add asset metadata to lp fee field in TSwapOutcome

## 0.1.1

### Patch Changes

- dd140ed: Updates the versioning because dependencies were not getting their workspace:\* version updated at publish time.

## 0.1.0

### Minor Changes

- 786dff4: Adds stableswap support to the `core` library and also updates packages to be self-supporting (i.e. no more peer dependency management).

## 0.0.2

### Patch Changes

- 637dd97: Publishes a new math library for calculations, and updates core to use it.
