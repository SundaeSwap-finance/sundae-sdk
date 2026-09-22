import { describe, expect, it } from "bun:test";
import { IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";

import {
  CALC_PRECISION,
  calculateLiquidity,
  calculatePinnedDeposit,
  getD,
  getPrice,
  getRawSwap,
  getSwapInput,
  getSwapOutput,
  invariantF,
  invariantG,
  pinnedDepositFromAnchor,
} from "../V4StableswapPool.js";

// These tests cover the v4 stableswap INVARIANT MODULE. They are unrelated to
// `StableSwapsPool.test.ts`, which covers the v3 stableswap CONTRACT.

const tokenB: IAssetAmountMetadata = {
  assetId: "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e42",
  decimals: 6,
};

const AMP = 200n;
const thirtyBps = new Fraction(3n, 1000n);
const twentyFiveBps = new Fraction(25n, 10000n);
const zeroFee = new Fraction(0n, 1n);

const UNIT_D = 2_000_000_000_000_000_000_000n; // D for (1e9, 1e9) at A = 200

describe("V4StableswapPool.getD", () => {
  it("matches the reference vector at balanced unit rates", () => {
    expect(getD(AMP, 1_000_000_000n, 1_000_000_000n)).toBe(UNIT_D);
  });

  it("matches the reference vector after a swap has moved the reserves", () => {
    expect(getD(AMP, 1_001_000_000n, 1_000_000_000n - 999_497n)).toBe(
      2_000_000_500_507_486_765_233n,
    );
  });

  it("reproduces the sum invariant the API reports for a live preview pool", () => {
    // Preview pool ac8d4b1b5fcadb3ac0247f7134ca08b061ee41b0c742dd4edf4c6244,
    // fetched from api.preview.sundae.fi: linearAmplificationFactor 200,
    // rates [1000000, 1001000], quantities [10794901263, 10186281970], and
    // sumInvariant 20991348225358657993984399717.
    //
    // This vector is what pins the amplification SCALE. The API serves one
    // amplification field for both the v3 Stableswaps contract and this curve.
    // If the stored value needed rescaling before it entered the v4 curve, D
    // would not land on the API's own figure.
    expect(
      getD(200n, 10_794_901_263n, 10_186_281_970n, 1_000_000n, 1_001_000n),
    ).toBe(20_991_348_225_358_657_993_984_399_717n);
  });

  it("returns the largest integer that satisfies the liquidity invariant", () => {
    const d = getD(AMP, 1_234_567n, 7_654_321n);
    const x = 1_234_567n * CALC_PRECISION;
    const y = 7_654_321n * CALC_PRECISION;
    expect(invariantF(x, y, AMP, d) <= 0n).toBe(true);
    expect(invariantF(x, y, AMP, d + 1n) > 0n).toBe(true);
  });

  it("is homogeneous: scaling both reserves scales D", () => {
    expect(getD(AMP, 2_000_000_000n, 2_000_000_000n)).toBe(2n * UNIT_D);
  });

  it("scales with the rates, and scaling both rates changes no price", () => {
    const a = getD(AMP, 1_000_000n, 2_000_000n, 3n, 5n);
    const b = getD(AMP, 1_000_000n, 2_000_000n, 30n, 50n);
    // Newton floors at each step, so the two agree to within integer dust
    // rather than exactly.
    const drift = b - 10n * a;
    expect(drift >= -8n && drift <= 8n).toBe(true);
  });

  it("rates move the balance point: [100, 1] balances a 1:100 reserve ratio", () => {
    // Balanced in rated units, so D equals the rated sum exactly.
    const d = getD(AMP, 1_000_000n, 100_000_000n, 100n, 1n);
    expect(d).toBe(200_000_000n * CALC_PRECISION);
  });

  it("returns zero for an empty pool", () => {
    expect(getD(AMP, 0n, 0n)).toBe(0n);
    // Rates do not rescue it and do not break it: zero times anything is zero.
    expect(getD(AMP, 0n, 0n, 1_000_000n, 1_001_000n)).toBe(0n);
  });

  it("rejects exactly one empty reserve instead of dividing by zero", () => {
    // The Newton step divides by 4*xs*ys, which is zero when one side is
    // empty. Without the guard this faults natively rather than reporting the
    // bad input. The chain cannot reach the state; a caller can.
    expect(() => getD(AMP, 0n, 1n)).toThrow("exactly one empty reserve");
    expect(() => getD(AMP, 1n, 0n)).toThrow("exactly one empty reserve");
    expect(() => getD(AMP, 0n, 1_000_000_000n, 1_000_000n, 1_001_000n)).toThrow(
      "exactly one empty reserve",
    );
  });

  it("rejects a negative reserve before anything else", () => {
    expect(() =>
      getD(AMP, -1n, 1_000n),
    ).toThrow("reserves must be non-negative");
  });

  it("rejects a non-positive amplification", () => {
    expect(() => getD(0n, 1_000n, 1_000n)).toThrow("amplification must be positive");
  });

  it("rejects a non-positive rate", () => {
    expect(() => getD(AMP, 1_000n, 1_000n, 0n, 1n)).toThrow("rates must be positive");
  });
});

describe("V4StableswapPool.getRawSwap", () => {
  it("matches the reference vector", () => {
    expect(getRawSwap(AMP, UNIT_D, 1_010_000_000n, 1_000_000_000n)).toBe(
      9_999_750_604_846_068_206n,
    );
  });

  it("returns the smallest output that satisfies the exchange invariant", () => {
    const raw = getRawSwap(AMP, UNIT_D, 1_010_000_000n, 1_000_000_000n);
    const xs = 1_010_000_000n * CALC_PRECISION;
    const y = 1_000_000_000n * CALC_PRECISION - raw;
    expect(invariantG(xs, y, AMP, UNIT_D) >= 0n).toBe(true);
    expect(invariantG(xs, y - 1n, AMP, UNIT_D) < 0n).toBe(true);
  });

  it("rejects a non-positive sum invariant", () => {
    expect(() => getRawSwap(AMP, 0n, 1_000n, 1_000n)).toThrow(
      "the sum invariant must be positive",
    );
  });
});

describe("V4StableswapPool.getSwapOutput", () => {
  it("reproduces the design-doc worked example (A = 200, 0.3%, balanced 1e9 pool)", () => {
    const { output, lpFee } = getSwapOutput(
      tokenB,
      10_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      thirtyBps,
    );
    // Gross 9 999 750, fee 30 000, trader receives 9 969 750.
    expect(lpFee.amount).toBe(30_000n);
    expect(output).toBe(9_969_750n);
  });

  it("reproduces a real preview fill", () => {
    // 10 000 000 in at fee 25/10000 on reserves 10 794 901 263 / 10 186 281 970
    // with rates [1 000 000, 1 001 000]: gross 9 988 563, fee 24 972,
    // payout 9 963 591.
    const { output, lpFee, nextInputReserve, nextOutputReserve } = getSwapOutput(
      tokenB,
      10_000_000n,
      10_794_901_263n,
      10_186_281_970n,
      1_000_000n,
      1_001_000n,
      AMP,
      twentyFiveBps,
    );
    expect(output + lpFee.amount).toBe(9_988_563n);
    expect(lpFee.amount).toBe(24_972n);
    expect(output).toBe(9_963_591n);
    expect(nextInputReserve).toBe(10_804_901_263n);
    expect(nextOutputReserve).toBe(10_186_281_970n - 9_963_591n);
  });

  it("denominates the fee in the output asset", () => {
    const { lpFee } = getSwapOutput(
      tokenB,
      10_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      thirtyBps,
    );
    expect(lpFee.metadata.assetId).toBe(tokenB.assetId);
  });

  it("charges nothing at a zero fee", () => {
    const { output, lpFee } = getSwapOutput(
      tokenB,
      10_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      zeroFee,
    );
    expect(lpFee.amount).toBe(0n);
    expect(output).toBe(9_999_750n);
  });

  it("prices at par, less one unit of rounding, for a small trade on a balanced pool", () => {
    // The exchange invariant picks the smallest integer output that keeps the
    // pool on the curve, so a fee-free trade rounds one unit against the
    // trader.
    const { output } = getSwapOutput(
      tokenB,
      1_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      zeroFee,
    );
    expect(output).toBe(999n);
  });

  it("slips more as the pool leaves balance", () => {
    const balanced = getSwapOutput(
      tokenB,
      100_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      zeroFee,
    );
    const skewed = getSwapOutput(
      tokenB,
      100_000_000n,
      1_800_000_000n,
      200_000_000n,
      1n,
      1n,
      AMP,
      zeroFee,
    );
    expect(skewed.output < balanced.output).toBe(true);
    expect(skewed.priceImpact.toNumber()).toBeGreaterThan(
      balanced.priceImpact.toNumber(),
    );
  });

  it("reports a small price impact for a small trade on a balanced pool", () => {
    // 1% of the pool moves the price by about 2.5 basis points at A = 200.
    const { priceImpact } = getSwapOutput(
      tokenB,
      10_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      zeroFee,
    );
    expect(priceImpact.toNumber()).toBeGreaterThan(0);
    expect(priceImpact.toNumber()).toBeLessThan(0.001);
  });

  it("honours the rates: a 1:100 rated pair trades at 100:1 in token units", () => {
    const { output } = getSwapOutput(
      tokenB,
      1_000n,
      1_000_000n,
      100_000_000n,
      100n,
      1n,
      AMP,
      zeroFee,
    );
    // Par is 100 000; the invariant rounds one unit against the trader.
    expect(output).toBe(99_999n);
  });

  it("rejects a supplied amount of zero", () => {
    expect(() =>
      getSwapOutput(tokenB, 0n, 1_000n, 1_000n, 1n, 1n, AMP, zeroFee),
    ).toThrow("Input and reserves must be positive");
  });

  it("rejects an empty reserve", () => {
    expect(() =>
      getSwapOutput(tokenB, 100n, 0n, 1_000n, 1n, 1n, AMP, zeroFee),
    ).toThrow("Input and reserves must be positive");
  });

  it("rejects a non-positive rate", () => {
    expect(() =>
      getSwapOutput(tokenB, 100n, 1_000n, 1_000n, 0n, 1n, AMP, zeroFee),
    ).toThrow("Rates must be positive");
  });

  it("rejects a non-positive amplification", () => {
    expect(() =>
      getSwapOutput(tokenB, 100n, 1_000n, 1_000n, 1n, 1n, 0n, zeroFee),
    ).toThrow("Amplification must be positive");
  });

  it("rejects a fee at or above one", () => {
    expect(() =>
      getSwapOutput(
        tokenB,
        100n,
        1_000n,
        1_000n,
        1n,
        1n,
        AMP,
        new Fraction(1n, 1n),
      ),
    ).toThrow("fee must be in [0, 1)");
  });

  it("rejects a trade the fee wipes out", () => {
    expect(() =>
      getSwapOutput(
        tokenB,
        1n,
        1_000_000_000n,
        1_000_000_000n,
        1n,
        1n,
        AMP,
        new Fraction(999n, 1000n),
      ),
    ).toThrow("Swap yields no output after the fee");
  });
});

describe("V4StableswapPool.getSwapInput", () => {
  const cases: Array<[string, bigint, bigint, bigint, bigint, bigint, Fraction]> =
    [
      ["balanced, no fee", 1_000_000_000n, 1_000_000_000n, 1n, 1n, 5_000_000n, zeroFee],
      ["balanced, 30 bps", 1_000_000_000n, 1_000_000_000n, 1n, 1n, 5_000_000n, thirtyBps],
      ["skewed, 30 bps", 1_800_000_000n, 200_000_000n, 1n, 1n, 1_000_000n, thirtyBps],
      [
        "rated, 25 bps",
        10_794_901_263n,
        10_186_281_970n,
        1_000_000n,
        1_001_000n,
        9_963_591n,
        twentyFiveBps,
      ],
      ["decimal-skewed rates", 1_000_000n, 100_000_000n, 100n, 1n, 500_000n, thirtyBps],
    ];

  for (const [name, inRes, outRes, rIn, rOut, want, fee] of cases) {
    it(`returns the minimal input that buys the output (${name})`, () => {
      const { input } = getSwapInput(
        tokenB,
        want,
        inRes,
        outRes,
        rIn,
        rOut,
        AMP,
        fee,
      );
      // The forward swap at that input reaches the target.
      expect(
        getSwapOutput(tokenB, input, inRes, outRes, rIn, rOut, AMP, fee).output >=
          want,
      ).toBe(true);
      // One unit less does not.
      expect(
        getSwapOutput(tokenB, input - 1n, inRes, outRes, rIn, rOut, AMP, fee)
          .output < want,
      ).toBe(true);
    });
  }

  it("round-trips the real preview fill to at most the original input", () => {
    const { input } = getSwapInput(
      tokenB,
      9_963_591n,
      10_794_901_263n,
      10_186_281_970n,
      1_000_000n,
      1_001_000n,
      AMP,
      twentyFiveBps,
    );
    expect(input).toBeLessThanOrEqual(10_000_000n);
    expect(input).toBeGreaterThan(9_900_000n);
  });

  it("denominates the fee in the output asset", () => {
    const { lpFee } = getSwapInput(
      tokenB,
      1_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      thirtyBps,
    );
    expect(lpFee.metadata.assetId).toBe(tokenB.assetId);
  });

  it("reports the reserves after the fill", () => {
    const { input, nextInputReserve, nextOutputReserve } = getSwapInput(
      tokenB,
      1_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
      thirtyBps,
    );
    expect(nextInputReserve).toBe(1_000_000_000n + input);
    expect(nextOutputReserve).toBe(1_000_000_000n - 1_000_000n);
  });

  it("rejects an output at or above the output reserve", () => {
    expect(() =>
      getSwapInput(
        tokenB,
        1_000_000_000n,
        1_000_000_000n,
        1_000_000_000n,
        1n,
        1n,
        AMP,
        zeroFee,
      ),
    ).toThrow("Output must be below the output reserve");
  });

  it("rejects an output the fee pushes past the reserve", () => {
    expect(() =>
      getSwapInput(
        tokenB,
        999_999_999n,
        1_000_000_000n,
        1_000_000_000n,
        1n,
        1n,
        AMP,
        thirtyBps,
      ),
    ).toThrow("the fee pushes it past the reserve");
  });

  it("rejects a non-positive output", () => {
    expect(() =>
      getSwapInput(tokenB, 0n, 1_000n, 1_000n, 1n, 1n, AMP, zeroFee),
    ).toThrow("Output and reserves must be positive");
  });
});

describe("V4StableswapPool.getPrice", () => {
  it("is the rate ratio at a balanced pool", () => {
    const p = getPrice(AMP, 1_000_000_000n, 1_000_000_000n);
    expect(p.toNumber()).toBeCloseTo(1, 12);
  });

  it("follows the rates: asset B worth 1.001 of asset A", () => {
    const p = getPrice(AMP, 1_001_000_000n, 1_000_000_000n, 1_000_000n, 1_001_000n);
    expect(p.toNumber()).toBeCloseTo(1.001, 6);
  });

  it("moves with the reserve ratio, but far less than a constant-product pool would", () => {
    // Asset A is abundant here, so asset B costs more than one A. A constant-
    // product pool at 1.8e9 / 0.2e9 would price B at 9 A; the stableswap curve
    // at A = 200 prices it at about 1.03 A.
    const p = getPrice(AMP, 1_800_000_000n, 200_000_000n);
    expect(p.toNumber()).toBeGreaterThan(1);
    expect(p.toNumber()).toBeLessThan(1.1);
  });

  it("agrees with the rate a small swap actually gets", () => {
    const p = getPrice(AMP, 1_800_000_000n, 200_000_000n).toNumber();
    // Give B, take A: the realized A-per-B rate should sit just under the
    // marginal price.
    const { output } = getSwapOutput(
      tokenB,
      1_000_000n,
      200_000_000n,
      1_800_000_000n,
      1n,
      1n,
      AMP,
      zeroFee,
    );
    const realized = Number(output) / 1_000_000;
    expect(realized).toBeLessThanOrEqual(p);
    expect(p - realized).toBeLessThan(0.001);
  });

  it("rejects an empty reserve", () => {
    expect(() => getPrice(AMP, 0n, 1_000n)).toThrow("reserves must be positive");
  });
});

describe("V4StableswapPool.calculateLiquidity", () => {
  it("pins the deposit to the scarcest offered asset and refunds the surplus", () => {
    const res = calculateLiquidity(
      100_000_000n,
      50_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      2_000_000_000n,
      1n,
      1n,
      AMP,
    );
    // The pool is balanced, so the 50 000 000 leg caps the fill.
    expect(res.actualDepositedB).toBe(50_000_000n);
    expect(res.actualDepositedA).toBe(50_000_000n);
    expect(res.bChange).toBe(0n);
    expect(res.aChange).toBe(50_000_000n);
    expect(res.generatedLp).toBe(100_000_000n);
    expect(res.nextTotalLp).toBe(2_100_000_000n);
  });

  it("mints proportionally for an exactly proportional offer", () => {
    const res = calculateLiquidity(
      100_000_000n,
      100_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      2_000_000_000n,
      1n,
      1n,
      AMP,
    );
    expect(res.aChange).toBe(0n);
    expect(res.bChange).toBe(0n);
    expect(res.generatedLp).toBe(200_000_000n);
    expect(res.shareAfterDeposit.toNumber()).toBeCloseTo(200 / 2200, 9);
  });

  it("keeps the deltas proportional when the reserves are not balanced", () => {
    const res = calculateLiquidity(
      180_000_000n,
      20_000_000n,
      1_800_000_000n,
      200_000_000n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
    );
    expect(res.actualDepositedA).toBe(180_000_000n);
    expect(res.actualDepositedB).toBe(20_000_000n);
    expect(res.aChange).toBe(0n);
    expect(res.bChange).toBe(0n);
  });

  it("ignores the rates in the deltas: a proportional move is proportional in any units", () => {
    const unrated = calculateLiquidity(
      100_000_000n,
      100_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      2_000_000_000n,
      1n,
      1n,
      AMP,
    );
    const rated = calculateLiquidity(
      100_000_000n,
      100_000_000n,
      1_000_000_000n,
      1_000_000_000n,
      2_000_000_000n,
      1_000_000n,
      1_001_000n,
      AMP,
    );
    expect(rated.actualDepositedA).toBe(unrated.actualDepositedA);
    expect(rated.actualDepositedB).toBe(unrated.actualDepositedB);
  });

  it("never pins a delta above what the depositor offered", () => {
    const res = calculateLiquidity(
      7_777_777n,
      3_333_333n,
      1_234_567_891n,
      987_654_321n,
      1_000_000_000n,
      1n,
      1n,
      AMP,
    );
    expect(res.actualDepositedA).toBeLessThanOrEqual(7_777_777n);
    expect(res.actualDepositedB).toBeLessThanOrEqual(3_333_333n);
    expect(res.aChange).toBeGreaterThanOrEqual(0n);
    expect(res.bChange).toBeGreaterThanOrEqual(0n);
  });

  it("rejects a one-sided deposit", () => {
    expect(() =>
      calculateLiquidity(
        100_000_000n,
        0n,
        1_000_000_000n,
        1_000_000_000n,
        2_000_000_000n,
        1n,
        1n,
        AMP,
      ),
    ).toThrow("must offer every pool asset in proportion");
  });

  it("rejects a deposit that mints no LP", () => {
    expect(() =>
      calculateLiquidity(
        1n,
        1n,
        1_000_000_000n,
        1_000_000_000n,
        2n,
        1n,
        1n,
        AMP,
      ),
    ).toThrow("Deposit mints zero LP");
  });

  it("rejects an empty pool", () => {
    expect(() =>
      calculateLiquidity(1n, 1n, 0n, 0n, 0n, 1n, 1n, AMP),
    ).toThrow("Not enough pool liquidity");
  });
});

describe("V4StableswapPool.calculatePinnedDeposit", () => {
  it("pins every quantity to the declared D delta", () => {
    const d = getD(AMP, 1_000_000_000n, 1_000_000_000n);
    const res = calculatePinnedDeposit(
      [100_000_000n, 100_000_000n],
      [1_000_000_000n, 1_000_000_000n],
      2_000_000_000n,
      d,
    );
    expect(res.targetDeltaD).toBe(d / 10n);
    expect(res.deltas).toEqual([100_000_000n, 100_000_000n]);
    expect(res.nextTotalLp).toBe(2_200_000_000n);
  });

  it("rejects a negative offer", () => {
    expect(() =>
      calculatePinnedDeposit([-1n, 1n], [1_000n, 1_000n], 1_000n, UNIT_D),
    ).toThrow("Deposit amounts must be non-negative");
  });

  it("rejects a pool with no LP supply", () => {
    expect(() =>
      calculatePinnedDeposit([1n, 1n], [1_000n, 1_000n], 0n, UNIT_D),
    ).toThrow("Not enough pool liquidity");
  });
});

describe("V4StableswapPool.pinnedDepositFromAnchor", () => {
  it("fills the other leg in proportion", () => {
    const d = getD(AMP, 1_000_000_000n, 500_000_000n);
    const [a, b] = pinnedDepositFromAnchor(0, 100_000_000n, [1_000_000_000n, 500_000_000n], d);
    expect(a).toBe(100_000_000n);
    expect(b).toBe(50_000_000n);
  });

  it("returns zeros for a zero anchor", () => {
    expect(
      pinnedDepositFromAnchor(0, 0n, [1_000n, 1_000n], UNIT_D),
    ).toEqual([0n, 0n]);
  });

  it("rejects an out-of-range anchor", () => {
    expect(() =>
      pinnedDepositFromAnchor(2, 1n, [1_000n, 1_000n], UNIT_D),
    ).toThrow("anchor index is out of range");
  });
});
