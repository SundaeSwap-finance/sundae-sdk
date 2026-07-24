import { describe, expect, it } from "bun:test";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";

import {
  calculateDepositN,
  calculateLiquidity,
  calculatePinnedDeposit,
  getSwapInput,
  getSwapOutput,
  pinnedDepositFromAnchor,
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
  // Target-pinned (the deployed validator's rule): the mint is capped by the
  // scarcest offered asset; extra above the pinned deltas is refunded.
  it("mints by the scarcest asset and refunds the excess", () => {
    const result = calculateLiquidity(
      100n,
      50n,
      1_000n,
      2_000n,
      5_000n,
      3n,
      5n,
    );
    // V_b = 3000 + 10000 = 13000; t = min(100·13000/1000, 50·13000/2000)
    //     = min(1300, 325) = 325.
    // deltas = [ceil(1000·325/13000), ceil(2000·325/13000)] = [25, 50].
    // after_lp = floor(5000·13325/13000) = 5125 -> minted 125.
    expect(result.generatedLp).toEqual(125n);
    expect(result.nextTotalLp).toEqual(5_125n);
    expect(result.actualDepositedA).toEqual(25n);
    expect(result.actualDepositedB).toEqual(50n);
    expect(result.aChange).toEqual(75n);
    expect(result.bChange).toEqual(0n);
  });

  it("rejects single-sided deposits (asymmetric deposits can't validate)", () => {
    expect(() =>
      calculateLiquidity(0n, 100n, 1_000n, 1_000n, 2_000n, 1n, 1n),
    ).toThrow(/every pool asset/);
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

  it("the 2-asset wrapper matches the pinned N-asset form", () => {
    const viaWrapper = calculateLiquidity(
      100n,
      50n,
      1_000n,
      2_000n,
      5_000n,
      3n,
      5n,
    );
    const viaPinned = calculatePinnedDeposit(
      [100n, 50n],
      [1_000n, 2_000n],
      [3n, 5n],
      5_000n,
    );
    expect(viaWrapper.generatedLp).toEqual(viaPinned.generatedLp);
    expect(viaWrapper.nextTotalLp).toEqual(viaPinned.nextTotalLp);
  });

  it("N-asset: rejects misaligned arrays", () => {
    expect(() =>
      calculateDepositN([1n, 2n], [10n, 20n, 30n], [1n, 1n, 1n], 100n),
    ).toThrow();
  });

  it("pinned: mints by the scarcest asset, deltas ceil-pinned, surplus implied", () => {
    // Live preview c618 shape: coprime-ish reserves, unit prices.
    const reserves = [26_018_415_418n, 1_997_073_427n, 2_000_535_565n];
    const prices = [1n, 1n, 1n];
    const totalLp = 30_016_024_410n;
    // Equal offers: t capped by the LARGEST reserve's coverage (USDR-like).
    const offered = [100_000_000n, 100_000_000n, 100_000_000n];
    const result = calculatePinnedDeposit(offered, reserves, prices, totalLp);

    const vB = reserves[0] + reserves[1] + reserves[2];
    const expectedT = (offered[0] * vB) / reserves[0]; // scarcest coverage
    expect(result.targetDeltaV).toEqual(expectedT);
    // Deltas never exceed the offers, and match the validator's ceil pin.
    result.deltas.forEach((delta, i) => {
      expect(delta).toBeLessThanOrEqual(offered[i]);
      expect(delta).toEqual(
        (reserves[i] * result.targetDeltaV + vB - 1n) / vB,
      );
    });
    expect(result.generatedLp).toEqual(
      (totalLp * (vB + result.targetDeltaV)) / vB - totalLp,
    );
    // The plain value formula would overstate the mint for this offer.
    const naive = calculateDepositN(offered, reserves, prices, totalLp);
    expect(naive.generatedLp).toBeGreaterThan(result.generatedLp);
  });

  it("pinned: rejects a deposit missing any pool asset", () => {
    expect(() =>
      calculatePinnedDeposit(
        [100n, 0n, 100n],
        [1_000n, 2_000n, 3_000n],
        [1n, 1n, 1n],
        6_000n,
      ),
    ).toThrow(/every pool asset/);
  });

  it("pinned: anchor auto-fill produces amounts the pin accepts at full t", () => {
    const reserves = [26_018_415_418n, 1_997_073_427n, 2_000_535_565n];
    const prices = [1n, 1n, 1n];
    const totalLp = 30_016_024_410n;
    const anchor = 100_000_000n;
    const filled = pinnedDepositFromAnchor(1, anchor, reserves, prices);
    expect(filled[1]).toEqual(anchor);
    // Depositing exactly the auto-filled amounts reaches (at least) the
    // anchor's implied t — nothing is scarcer than the anchor.
    const vB = reserves[0] + reserves[1] + reserves[2];
    const anchorT = (anchor * vB) / reserves[1];
    const result = calculatePinnedDeposit(filled, reserves, prices, totalLp);
    expect(result.targetDeltaV).toBeGreaterThanOrEqual(anchorT);
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
