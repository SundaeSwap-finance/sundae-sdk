---
"@sundaeswap/math": major
"@sundaeswap/core": major
---

Concentrated liquidity is now the ladder curve. The single-range curve is
deleted, and the ladder curve takes its name. The single-range curve never
reached production. sundae-v4 made the same change to its contracts.

`@sundaeswap/math`:

- `ConcentratedLiquidityPool` is now the ladder math. It was
  `BandedConcentratedLiquidityPool`. The members are the same.
- `BandedConcentratedLiquidityPool` is removed.
- The single-range members are removed: `getSwapInput`,
  `calculateLiquidity`, `TSqrtPrice`, and the single-range `getSwapOutput`.

`@sundaeswap/core`:

- `EPoolCurve.ConcentratedLiquidity` (`"concentrated_liquidity"`) is now the
  ladder curve. `EPoolCurve.BandedConcentratedLiquidity` is removed.
- The query provider maps the API identifier `concentrated_liquidity` to
  `EPoolCurve.ConcentratedLiquidity`. It also maps the old identifier
  `banded_concentrated_liquidity` to it, until the API sends the new one.
- `IPoolData.sqrtPrices` is removed. The pool queries no longer select
  `sqrtPrices`.
- `SundaeUtils.getSwapInput` throws for a concentrated-liquidity pool. It
  used the single-range math before.
- `TPoolCurveV4` kind `"bandedConcentratedLiquidity"` is now
  `"concentratedLiquidity"`.
- `V4_VALIDATORS.bandedConcentratedLiquidity` is now
  `V4_VALIDATORS.concentratedLiquidity`, with the title
  `concentrated_liquidity.withdraw`. `TxBuilderV4.mintPool` uses the old
  title `banded_concentrated_liquidity.withdraw` when the protocol row has
  no entry for the new title.
- `DatumBuilderV4.buildBandedCLConfigDatum` is now
  `buildConcentratedLiquidityConfigDatum`, and
  `DatumBuilderV4.buildBandedCLCreateRedeemer` is now
  `buildConcentratedLiquidityCreateRedeemer`.
- The contract types `BandedCLConfig` and `BandedCLCreate` are now
  `ConcentratedLiquidityConfig` and `ConcentratedLiquidityCreate`.
