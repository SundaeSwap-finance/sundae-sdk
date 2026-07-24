import { describe, expect, it } from "bun:test";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";

import {
  calculateDepositN,
  calculateLiquidity,
  getSwapInput,
  getSwapOutput,
} from "../ConstantSumPool.js";

const tokenA: IAssetAmountMetadata = {
  assetId: "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e41",
  decimals: 0,
};

const threePct = new Fraction(3n, 1000n);

describe("ConstantSumPool.getSwapOutput", () => {
  it("throws on non-positive input, reserves, or prices", () => {
    expect(() =>
      getSwapOutput(tokenA, -1n, 10n, 10n, 1n, 1n, threePct),
    ).toThrow();
    expect(() =>
      getSwapOutput(tokenA, 1n, -10n, 10n, 1n, 1n, threePct),
    ).toThrow();
    expect(() =>
      getSwapOutput(tokenA, 1n, 10n, 10n, 0n, 1n, threePct),
    ).toThrow();
  });

  it("throws when the fee is out of [0,1]", () => {
    expect(() =>
      getSwapOutput(tokenA, 1n, 10n, 10n, 1n, 1n, Fraction.asFraction(1.1)),
    ).toThrow();
  });

  // Vectors cross-checked against the scooper's cs_swap_result and the live
  // pools.quote endpoint (sundae-protocol). out = floor((dx·priceIn −
  // floor(dx·priceIn·fee)) / priceOut).
  it("matches the scooper at par prices (equal prices, 0.3% fee)", () => {
    // 10000 in, prices 1e6/1e6, fee 3/1000 -> 9970 out.
    const { output } = getSwapOutput(
      tokenA,
      10_000n,
      1_000_000_000n,
      1_000_000_000n,
      1_000_000n,
      1_000_000n,
      threePct,
    );
    expect(output).toEqual(9970n);
  });

  it("matches the live quote for skewed prices", () => {
    // priceIn=7, priceOut=3, 1000 in -> 2326 (tOKENA->tOKENB on preview).
    expect(
      getSwapOutput(tokenA, 1_000n, 1_000_000n, 1_000_000n, 7n, 3n, threePct)
        .output,
    ).toEqual(2326n);
    // priceIn=3, priceOut=5 -> 598 (tOKENB->ADAb).
    expect(
      getSwapOutput(tokenA, 1_000n, 1_000_000n, 1_000_000n, 3n, 5n, threePct)
        .output,
    ).toEqual(598n);
    // priceIn=5, priceOut=3 -> 1661 (ADAb->tOKENB).
    expect(
      getSwapOutput(tokenA, 1_000n, 1_000_000n, 1_000_000n, 5n, 3n, threePct)
        .output,
    ).toEqual(1661n);
  });

  it("caps the output at the output reserve", () => {
    const { output } = getSwapOutput(
      tokenA,
      1_000_000n,
      10n,
      5n, // tiny output reserve
      1_000_000n,
      1n,
      threePct,
    );
    expect(output).toEqual(5n);
  });

  it("reports the lp fee in input-asset units", () => {
    const { lpFee } = getSwapOutput(
      tokenA,
      10_000n,
      1_000_000_000n,
      1_000_000_000n,
      1_000_000n,
      1_000_000n,
      threePct,
    );
    // 10000 * 3/1000 = 30 (input units).
    expect(lpFee.amount).toEqual(30n);
    expect(lpFee.metadata.assetId).toEqual(tokenA.assetId);
  });
});

describe("ConstantSumPool.getSwapInput", () => {
  it("throws on non-positive output, reserves, or prices", () => {
    expect(() => getSwapInput(tokenA, 0n, 10n, 10n, 1n, 1n, threePct)).toThrow();
    expect(() => getSwapInput(tokenA, 1n, 0n, 10n, 1n, 1n, threePct)).toThrow();
    expect(() => getSwapInput(tokenA, 1n, 10n, 10n, 1n, 0n, threePct)).toThrow();
  });

  it("throws when the output exceeds the output reserve, but allows draining it", () => {
    expect(() =>
      getSwapInput(tokenA, 11n, 1_000n, 10n, 1n, 1n, threePct),
    ).toThrow();
    expect(
      getSwapInput(tokenA, 10n, 1_000n, 10n, 1n, 1n, threePct).input,
    ).toBeGreaterThan(0n);
  });

  it("throws when the fee is 1 or more", () => {
    expect(() =>
      getSwapInput(tokenA, 1n, 10n, 10n, 1n, 1n, Fraction.ONE),
    ).toThrow();
  });

  it("inverts getSwapOutput at par prices", () => {
    // Forward: 10000 in -> 9970 out. Inverse of 9970 must be minimal.
    const { input } = getSwapInput(
      tokenA,
      9_970n,
      1_000_000_000n,
      1_000_000_000n,
      1_000_000n,
      1_000_000n,
      threePct,
    );
    expect(
      getSwapOutput(
        tokenA,
        input,
        1_000_000_000n,
        1_000_000_000n,
        1_000_000n,
        1_000_000n,
        threePct,
      ).output,
    ).toBeGreaterThanOrEqual(9_970n);
    expect(input).toBeLessThanOrEqual(10_000n);
  });

  it("returns the minimal input across skewed prices and fees", () => {
    const vectors: Array<[bigint, bigint, bigint, Fraction]> = [
      [2_326n, 7n, 3n, threePct],
      [598n, 3n, 5n, threePct],
      [1_661n, 5n, 3n, threePct],
      [1_000n, 1n, 1n, Fraction.ZERO],
      [12_345n, 1_000_000n, 999_000n, new Fraction(1n, 100n)],
    ];
    for (const [output, priceIn, priceOut, fee] of vectors) {
      const { input } = getSwapInput(
        tokenA,
        output,
        1_000_000_000n,
        1_000_000_000n,
        priceIn,
        priceOut,
        fee,
      );
      const forward = (candidate: bigint) =>
        getSwapOutput(
          tokenA,
          candidate,
          1_000_000_000n,
          1_000_000_000n,
          priceIn,
          priceOut,
          fee,
        ).output;
      // Sufficient: the computed input actually yields the requested output…
      expect(forward(input)).toBeGreaterThanOrEqual(output);
      // …and minimal: one unit less does not.
      if (input > 1n) {
        expect(forward(input - 1n)).toBeLessThan(output);
      }
    }
  });
});

describe("ConstantSumPool.calculateLiquidity", () => {
  // Mirrors cs_math.ak compute_deposit_n:
  //   lp = (a·priceA + b·priceB) · totalLp / (aReserve·priceA + bReserve·priceB)
  it("values mixed deposits at the pool prices with no refunds", () => {
    const result = calculateLiquidity(
      100n,
      50n,
      1_000n,
      2_000n,
      5_000n,
      3n,
      5n,
    );
    // depositValue = 100·3 + 50·5 = 550; totalValue = 3000 + 10000 = 13000.
    // lp = 550·5000/13000 = 211 (floored).
    expect(result.generatedLp).toEqual(211n);
    expect(result.nextTotalLp).toEqual(5_211n);
    expect(result.aChange).toEqual(0n);
    expect(result.bChange).toEqual(0n);
    expect(result.actualDepositedA).toEqual(100n);
    expect(result.actualDepositedB).toEqual(50n);
  });

  it("accepts single-sided deposits", () => {
    const result = calculateLiquidity(0n, 100n, 1_000n, 1_000n, 2_000n, 1n, 1n);
    // depositValue = 100; totalValue = 2000; lp = 100·2000/2000 = 100.
    expect(result.generatedLp).toEqual(100n);
    expect(result.shareAfterDeposit.toNumber()).toBeCloseTo(100 / 2100);
  });

  it("N-asset: values the deposit against ALL reserves, not just the touched pair", () => {
    // 3-asset pool, unit prices: totalValue = 1000 + 2000 + 7000 = 10000.
    // Depositing 100 of asset0 only: lp = 100·5000/10000 = 50 — NOT the
    // 100·5000/3000 = 166 a pair-only totalValue would claim.
    const result = calculateDepositN(
      [100n, 0n, 0n],
      [1_000n, 2_000n, 7_000n],
      [1n, 1n, 1n],
      5_000n,
    );
    expect(result.generatedLp).toEqual(50n);
    expect(result.nextTotalLp).toEqual(5_050n);
  });

  it("N-asset: matches the 2-asset wrapper for two assets", () => {
    const viaWrapper = calculateLiquidity(
      100n,
      50n,
      1_000n,
      2_000n,
      5_000n,
      3n,
      5n,
    );
    const viaN = calculateDepositN(
      [100n, 50n],
      [1_000n, 2_000n],
      [3n, 5n],
      5_000n,
    );
    expect(viaN.generatedLp).toEqual(viaWrapper.generatedLp);
    expect(viaN.nextTotalLp).toEqual(viaWrapper.nextTotalLp);
  });

  it("N-asset: rejects misaligned arrays", () => {
    expect(() =>
      calculateDepositN([1n, 2n], [10n, 20n, 30n], [1n, 1n, 1n], 100n),
    ).toThrow();
  });

  it("throws on empty deposits, empty pools, or bad prices", () => {
    expect(() =>
      calculateLiquidity(0n, 0n, 1_000n, 1_000n, 2_000n, 1n, 1n),
    ).toThrow();
    expect(() => calculateLiquidity(1n, 1n, 0n, 0n, 0n, 1n, 1n)).toThrow();
    expect(() =>
      calculateLiquidity(1n, 1n, 1_000n, 1_000n, 2_000n, 0n, 1n),
    ).toThrow();
  });
});
