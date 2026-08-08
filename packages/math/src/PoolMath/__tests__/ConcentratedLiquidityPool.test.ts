import { describe, expect, it } from "bun:test";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";

import {
  calculateLiquidity,
  getSwapInput,
  getSwapOutput,
  type TSqrtPrice,
} from "../ConcentratedLiquidityPool.js";

const tokenA: IAssetAmountMetadata = {
  assetId: "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e41",
  decimals: 0,
};

const threePct = new Fraction(3n, 1000n);
const zeroFee = new Fraction(0n, 1n);

// Range [0.5, 2.0] as sqrt-price rationals.
const spa: TSqrtPrice = [1n, 2n];
const spb: TSqrtPrice = [2n, 1n];

/** Direct evaluation of the on-chain/scooper virtual-reserve swap formula. */
const refOutput = (
  dx: bigint,
  a: bigint,
  b: bigint,
  l: bigint,
  isAInput: boolean,
  feeNum: bigint,
  feeDen: bigint,
): bigint => {
  const fee = (dx * feeNum) / feeDen;
  const dxEff = dx - fee;
  const va0 = a * spb[0] + l * spb[1];
  const vb0 = b * spa[1] + l * spa[0];
  if (isAInput) {
    const dvaEff = dxEff * spb[0];
    return (vb0 * dvaEff) / ((va0 + dvaEff) * spa[1]);
  }
  const dvbEff = dxEff * spa[0];
  return (va0 * dvbEff) / ((vb0 + dvbEff) * spb[0]);
};

describe("ConcentratedLiquidityPool.getSwapOutput", () => {
  it("matches the hand-computed virtual-reserve formula (A→B, no fee)", () => {
    // a=b=L=1000, range [0.5,2]: va0=vb0=3000, dvaEff=200,
    // out = 3000·200 / ((3000+200)·2) = 600000/6400 = 93.75 -> 93.
    const { output } = getSwapOutput(
      tokenA,
      100n,
      1000n,
      1000n,
      1000n,
      spa,
      spb,
      zeroFee,
      true,
    );
    expect(output).toEqual(93n);
  });

  it("matches the hand-computed formula (B→A, no fee)", () => {
    // dvbEff=100, out = 3000·100 / ((3000+100)·2) = 300000/6200 = 48.38 -> 48.
    const { output } = getSwapOutput(
      tokenA,
      100n,
      1000n,
      1000n,
      1000n,
      spa,
      spb,
      zeroFee,
      false,
    );
    expect(output).toEqual(48n);
  });

  it("agrees with the reference evaluator across sizes and fees", () => {
    for (const isAInput of [true, false]) {
      for (const dx of [1n, 7n, 100n, 5000n, 250000n]) {
        const { output } = getSwapOutput(
          tokenA,
          dx,
          1_000_000n,
          1_000_000n,
          1_000_000n,
          spa,
          spb,
          threePct,
          isAInput,
        );
        expect(output).toEqual(
          refOutput(dx, 1_000_000n, 1_000_000n, 1_000_000n, isAInput, 3n, 1000n),
        );
      }
    }
  });

  it("caps output at the output reserve", () => {
    const { output } = getSwapOutput(
      tokenA,
      10_000_000n,
      100n,
      5n,
      1_000_000n,
      spa,
      spb,
      zeroFee,
      true,
    );
    expect(output).toBeLessThanOrEqual(5n);
  });

  it("throws on non-positive input/reserves/liquidity", () => {
    expect(() =>
      getSwapOutput(tokenA, 0n, 10n, 10n, 10n, spa, spb, zeroFee, true),
    ).toThrow();
    expect(() =>
      getSwapOutput(tokenA, 1n, 10n, 10n, 0n, spa, spb, zeroFee, true),
    ).toThrow();
  });
});

describe("ConcentratedLiquidityPool.getSwapInput", () => {
  it("returns the minimal input whose forward swap clears the target", () => {
    for (const isAInput of [true, false]) {
      for (const targetOut of [1n, 40n, 93n, 1000n, 90_000n]) {
        const { input } = getSwapInput(
          tokenA,
          targetOut,
          1_000_000n,
          1_000_000n,
          1_000_000n,
          spa,
          spb,
          threePct,
          isAInput,
        );
        const got = getSwapOutput(
          tokenA,
          input,
          1_000_000n,
          1_000_000n,
          1_000_000n,
          spa,
          spb,
          threePct,
          isAInput,
        ).output;
        // Reaches the target...
        expect(got).toBeGreaterThanOrEqual(targetOut);
        // ...and is minimal: one unit less falls short.
        const less = getSwapOutput(
          tokenA,
          input - 1n,
          1_000_000n,
          1_000_000n,
          1_000_000n,
          spa,
          spb,
          threePct,
          isAInput,
        ).output;
        expect(less).toBeLessThan(targetOut);
      }
    }
  });

  it("throws when the output exceeds the reserve", () => {
    expect(() =>
      getSwapInput(tokenA, 200n, 1000n, 100n, 1000n, spa, spb, threePct, true),
    ).toThrow();
  });
});

describe("ConcentratedLiquidityPool.calculateLiquidity", () => {
  // The on-chain CL non-swap invariant a proportional deposit must satisfy.
  const invariantHolds = (
    a0: bigint,
    b0: bigint,
    l0: bigint,
    da: bigint,
    db: bigint,
    dl: bigint,
  ): boolean => {
    const va0 = a0 * spb[0] + l0 * spb[1];
    const vb0 = b0 * spa[1] + l0 * spa[0];
    const a1 = a0 + da;
    const b1 = b0 + db;
    const l1 = l0 + dl;
    const va1 = a1 * spb[0] + l1 * spb[1];
    const vb1 = b1 * spa[1] + l1 * spa[0];
    return va1 * vb1 * l0 * l0 >= va0 * vb0 * l1 * l1;
  };

  it("mints proportionally and the fill satisfies the CL invariant", () => {
    const cases: Array<[bigint, bigint, bigint, bigint, bigint]> = [
      // [offeredA, offeredB, reserveA, reserveB, totalLp]
      [100n, 100n, 1000n, 1000n, 1000n],
      [100n, 250n, 1000n, 1000n, 1000n], // B surplus
      [500n, 100n, 3333n, 991n, 1777n], // coprime-ish reserves
      [12345n, 67890n, 1_000_000n, 5_000_000n, 2_000_000n],
    ];
    for (const [a, b, ra, rb, lp] of cases) {
      const res = calculateLiquidity(a, b, ra, rb, lp);
      expect(res.generatedLp).toBeGreaterThan(0n);
      // Never consumes more than offered.
      expect(res.actualDepositedA).toBeLessThanOrEqual(a);
      expect(res.actualDepositedB).toBeLessThanOrEqual(b);
      // The resulting deposit is chain-valid under the CL invariant.
      expect(
        invariantHolds(
          ra,
          rb,
          lp,
          res.actualDepositedA,
          res.actualDepositedB,
          res.generatedLp,
        ),
      ).toBe(true);
    }
  });
});
