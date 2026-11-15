---
"@sundaeswap/math": minor
"@sundaeswap/core": minor
---

Concentrated liquidity on Sundae v4 is now the ladder curve. The SDK
supports it. The old single-range curve did not reach production, and
this release removes it.

A concentrated-liquidity pool is a ladder of sqrt-price bands. Each band
is a concentrated-liquidity arc or a constant-sum bin, with its own share
of the pool's liquidity and its own two fees. LP is one fungible token for
the whole ladder.

## What you can do

- **Quote swaps.** `SundaeUtils.getSwapOutput` quotes a
  concentrated-liquidity pool across as many bands as the swap crosses.
  `SundaeUtils.calculateLiquidity` quotes a deposit. The math is
  `ConcentratedLiquidityPool` in `@sundaeswap/math`: the ladder index, the
  witness search, the multi-band swap output, per-band state and the ladder
  builders `uniformLadder` and `shapedLadder`. The on-chain test vectors
  check it.
- **Read pool data.** The query provider reads the ladder from the API
  into `IPoolData`: `bands` (type `IPoolBand`), `bandClosing`, `activeBand`,
  `bandCounter` and `bandWeightTotal`. It maps the API identifier
  `concentrated_liquidity` to `EPoolCurve.ConcentratedLiquidity`. It also
  accepts the identifier that the API used before the rename.
- **Create pools.** `TxBuilderV4.mintPool` with
  `curve: { kind: "concentratedLiquidity", ladder, launchSqrtPrice }`
  creates a pool, with or without the oracle module (`oracle: true`). The
  SDK calculates the reserves from the ladder at the launch price. The
  pool's `total_lp` is the ladder counter. `DatumBuilderV4` builds the
  module's config (`buildConcentratedLiquidityConfigDatum`) and its Create
  redeemer (`buildConcentratedLiquidityCreateRedeemer`).
- **Move liquidity.** `TxBuilderV4.moveLiquidity` puts a movement of
  liquidity between pools into one order.

## Fixes from the sundae-v4 SV4 audit

- The band fee rounds up, as the contract does (`bandFee`). A quote can
  pay one unit less than with a fee that rounds down.
- The contract requires a counter (`total_lp`) of at least
  `1000 × weightTotal` at Create (`MIN_COUNTER_PER_WEIGHT`,
  `minCreateCounter`). `mintPool` throws for a smaller explicit `counter`.
  The default counter is the larger of 1,000,000,000 and that minimum.

## Changes to the concentrated-liquidity API

The single-range curve never reached mainnet, so this release removes it
in a minor version. `EPoolCurve.ConcentratedLiquidity`
(`"concentrated_liquidity"`) now means the ladder curve, not the
single-range curve.

Removed from `@sundaeswap/math`, in `ConcentratedLiquidityPool`:

- `getSwapInput`
- `calculateLiquidity`
- `TSqrtPrice`
- the single-range `getSwapOutput` signature. `getSwapOutput` now takes
  `(inputMetadata, input, aReserve, bReserve, ladder, isAInput, hint?)`.

Removed from `@sundaeswap/core`:

- `IPoolData.sqrtPrices`. The pool queries no longer select `sqrtPrices`.
- The single-range branches of `SundaeUtils`. `SundaeUtils.getSwapInput`
  now throws for a concentrated-liquidity pool.

Renamed in pre-release builds of this work:

- `BandedConcentratedLiquidityPool` is now `ConcentratedLiquidityPool`.
- `EPoolCurve.BandedConcentratedLiquidity` is now
  `EPoolCurve.ConcentratedLiquidity`.
- The `mintPool` kind `"bandedConcentratedLiquidity"` is now
  `"concentratedLiquidity"`.
- `V4_VALIDATORS.bandedConcentratedLiquidity` is now
  `V4_VALIDATORS.concentratedLiquidity`, with the title
  `concentrated_liquidity.withdraw`. `mintPool` uses the old title
  `banded_concentrated_liquidity.withdraw` if the protocol has no entry for
  the new title.
- `DatumBuilderV4.buildBandedCLConfigDatum` and
  `buildBandedCLCreateRedeemer` are now
  `buildConcentratedLiquidityConfigDatum` and
  `buildConcentratedLiquidityCreateRedeemer`.
- The contract types `BandedCLConfig` and `BandedCLCreate` are now
  `ConcentratedLiquidityConfig` and `ConcentratedLiquidityCreate`.
