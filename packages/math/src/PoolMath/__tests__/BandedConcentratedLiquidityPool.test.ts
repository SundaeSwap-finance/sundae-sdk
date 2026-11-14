import { describe, expect, it } from "bun:test";
import { IAssetAmountMetadata } from "@sundaeswap/asset";

import {
  aSat,
  bandOf,
  bandOutput,
  bandProof,
  bandStates,
  bandView,
  buildIndex,
  findWitness,
  getSwapOutput,
  indexLadder,
  liquidityOf,
  prefixes,
  reservesAt,
  shapedLadder,
  swapSteps,
  type TLadder,
  uniformLadder,
} from "../BandedConcentratedLiquidityPool.js";

const tokenB: IAssetAmountMetadata = {
  assetId: "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e42",
  decimals: 0,
};

// The eight equal-weight ladder of sundae-v4's lib/tests/unit/banded_cl_check.ak
// (edges 1.00..1.08 at 1e6, fee 3/1000).
const fee = { num: 3n, den: 1000n };
const den = 1_000_000n;
const eq8: TLadder = {
  bands: Array.from({ length: 8 }, (_, i) => ({
    start: { num: 1_000_000n + 10_000n * BigInt(i), den },
    weight: 1n,
    curve: 0 as const,
    feeBuy: fee,
    feeSell: fee,
  })),
  closing: { num: 1_080_000n, den },
  weightTotal: 8n,
};
const A = 8_637_368n;
const B = 624_999n;

describe("BandedConcentratedLiquidityPool: the on-chain vectors", () => {
  it("finds the witness the Aiken test names", () => {
    const w = findWitness(eq8, A, B)!;
    expect(w.x).toBe(999_999_813n);
    expect(w.k).toBe(0);
    const l = indexLadder(eq8);
    const p = prefixes(l, w.x, w.k);
    expect(p.ca).toBe(8_021_634n);
    expect(p.cb).toBe(0n);
    expect(liquidityOf(l, w.x, w.k)).toBe(124_999_976n);
    expect(aSat(l, w.x, w.k)).toBe(1_237_624n);
    expect(bandProof(l, A, B, 999_999_813n, 0)).toBe(true);
    expect(bandProof(l, A, B, 71_428_457n, 7)).toBe(false);
  });

  it("finds the post-swap witness", () => {
    expect(findWitness(eq8, 8_636_752n, 625_623n)!.x).toBe(999_999_938n);
  });

  // sundae-v4 #228 (SV4-006): the band fee rounds UP, so 624 B pays a fee
  // of ceil(624 * 3 / 1000) = 2 and the pair admits 615 A. With the floored
  // fee of 1 it admitted 616. lib/tests/unit/cl_check_unit.ak.
  it("pays 615 A for 624 B, the band fee rounded up to 2", () => {
    const out = getSwapOutput(tokenB, 624n, A, B, eq8, false);
    expect(out.output).toBe(615n);
    expect(out.lpFee.amount).toBe(2n);
    expect(out.steps.length).toBe(1);
    expect(out.steps[0]!.after.x).toBe(1_000_000_062n);
    expect(findWitness(eq8, A - 615n, B + 624n)!.x).toBe(1_000_000_062n);
  });

  it("recovers from a stale hint", () => {
    const out = getSwapOutput(tokenB, 624n, A, B, eq8, false, { x: 123n, k: 5 });
    expect(out.output).toBe(615n);
  });

  it("charges a fee of one unit on an input below den / num", () => {
    const l = indexLadder(eq8);
    const v = bandView(l, A, B, findWitness(l, A, B)!);
    // ceil(1 * 3 / 1000) = 1, so one unit of input has no effective input.
    expect(bandOutput(v, false, 1n)).toBe(0n);
    // ceil(333 * 3 / 1000) = 1: dx_eff = 332.
    const free = { ...v, feeBuy: { num: 0n, den: 1n } };
    expect(bandOutput(v, false, 333n)).toBe(bandOutput(free, false, 332n));
    // ceil(1000 * 3 / 1000) = 3 exactly: no extra unit when it divides.
    expect(bandOutput(v, false, 1_000n)).toBe(bandOutput(free, false, 997n));
    // A zero rate still charges nothing, whatever its denominator.
    const zero = { ...v, feeBuy: { num: 0n, den: 1_000n } };
    expect(bandOutput(zero, false, 1_000n)).toBe(bandOutput(free, false, 1_000n));
  });

  it("crosses bands for an input larger than the active band", () => {
    const l = indexLadder(eq8);
    const w = findWitness(l, A, B)!;
    // Band 0 holds a_sat_0 of A; buying more than that crosses into band 1.
    const steps = swapSteps(l, A, B, false, 2_000_000n, w)!;
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0]!.band).toBe(0);
    expect(steps[1]!.band).toBe(1);
    const total = steps.reduce((s, st) => s + st.output, 0n);
    expect(total).toBeGreaterThan(1_237_624n);
    expect(total).toBeLessThan(A);
  });

  it("refuses an input the ladder cannot absorb", () => {
    // The price sits in band 0: selling A pays out band 0's B residual and
    // then has no band below to walk into.
    const small = getSwapOutput(tokenB, 1_000n, A, B, eq8, true);
    expect(small.output).toBeGreaterThan(0n);
    expect(() => getSwapOutput(tokenB, 1_000_000_000n, A, B, eq8, true)).toThrow();
  });

  it("splits the reserves across the bands exactly", () => {
    const states = bandStates(eq8, A, B)!;
    expect(states.length).toBe(8);
    expect(states[0]!.active).toBe(true);
    const sumA = states.reduce((s, b) => s + b.quantities[0], 0n);
    const sumB = states.reduce((s, b) => s + b.quantities[1], 0n);
    expect(sumA).toBe(A);
    expect(sumB).toBe(B);
    for (let i = 1; i < 8; i++) expect(states[i]!.quantities[1]).toBe(0n);
  });
});

describe("BandedConcentratedLiquidityPool: building a ladder", () => {
  it("derives reserves at a launch price that the ladder then witnesses", () => {
    const ladder = shapedLadder(8, { num: 95n, den: 100n }, { num: 105n, den: 100n }, fee, {
      shape: "concentrated",
    });
    expect(ladder.weightTotal).toBe(ladder.bands.reduce((s, b) => s + b.weight, 0n));
    const launch = { num: 1n, den: 1n };
    const k = bandOf(ladder, launch);
    const r = reservesAt(ladder, 1_000_000_000n, k, launch);
    const w = findWitness(ladder, r.A, r.B)!;
    expect(w).not.toBeNull();
    // The reserves are floored, so the band the chain derives can sit one
    // below the one asked for; a creator takes the witness's band.
    expect(Math.abs(w.k - k)).toBeLessThanOrEqual(1);
    expect(buildIndex(ladder).length).toBe(8);
  });

  it("keeps uniform edges in lowest terms and refuses an inverted range", () => {
    const u = uniformLadder(4, { num: 1n, den: 2n }, { num: 2n, den: 1n }, fee);
    expect(u.bands[0]!.start).toEqual({ num: 1n, den: 2n });
    expect(u.closing).toEqual({ num: 2n, den: 1n });
    expect(() => uniformLadder(4, { num: 2n, den: 1n }, { num: 1n, den: 2n }, fee)).toThrow();
  });
});

// The scaling bench of sundae-v4 validators/benches/scaling/cl.ak after #228
// (the band fee rounded up): for N equal-weight bands with edges
// 1.00 + 0.01*j and fee 3/1000, a B-in swap of 0.1% of the B reserve.
// Each row is (N, A, B, X, k, A', B', X', budget); the chain admits A - A'.
const benchRows: [number, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint][] = [
    [1, 4925865n, 4999999n, 999999826n, 0n, 4920931n, 5004998n, 1000001381n, 1555n],
    [2, 2414759n, 7500000n, 999999999n, 1n, 2407502n, 7507500n, 1000002313n, 2314n],
    [3, 4782629n, 5000000n, 999999899n, 1n, 4777791n, 5005000n, 1000001399n, 1500n],
    [4, 3517823n, 6249999n, 999999799n, 2n, 3511894n, 6256248n, 1000001620n, 1821n],
    [5, 4645760n, 4999999n, 999999749n, 2n, 4641017n, 5004998n, 1000001269n, 1520n],
    [6, 3797891n, 5833333n, 999999799n, 3n, 3792463n, 5839166n, 1000001701n, 1902n],
    [7, 4514876n, 5000000n, 999999766n, 3n, 4510223n, 5005000n, 1000001333n, 1567n],
    [8, 3876484n, 5624999n, 999999799n, 4n, 3871350n, 5630623n, 1000001551n, 1752n],
    [9, 4389622n, 4999999n, 999999674n, 4n, 4385059n, 5004998n, 1000001303n, 1629n],
    [10, 3877638n, 5500000n, 999999786n, 5n, 3872713n, 5505500n, 1000001599n, 1813n],
    [11, 4269672n, 5000000n, 999999879n, 5n, 4265194n, 5005000n, 1000001446n, 1567n],
    [12, 3842499n, 5416666n, 999999799n, 6n, 3837740n, 5422082n, 1000001599n, 1800n],
    [13, 4154721n, 4999999n, 999999649n, 6n, 4150328n, 5004998n, 1000001383n, 1734n],
    [14, 3788541n, 5357142n, 999999799n, 7n, 3783921n, 5362499n, 1000001599n, 1800n],
    [15, 4044489n, 5000000n, 999999848n, 7n, 4040176n, 5005000n, 1000001445n, 1597n],
    [16, 3724376n, 5312499n, 999999799n, 8n, 3719878n, 5317811n, 1000001399n, 1600n],
    [17, 3938713n, 4999999n, 999999712n, 8n, 3934480n, 5004998n, 1000001387n, 1675n],
    [18, 3654687n, 5277777n, 999999643n, 9n, 3650300n, 5283054n, 1000001395n, 1752n],
    [19, 3837151n, 5000000n, 999999903n, 9n, 3832994n, 5005000n, 1000001455n, 1552n],
    [20, 3582202n, 5249999n, 999999799n, 10n, 3577917n, 5255248n, 1000001399n, 1600n],
    [21, 3739575n, 4999999n, 999999692n, 10n, 3735494n, 5004998n, 1000001309n, 1617n],
    [22, 3508584n, 5227272n, 999999799n, 11n, 3504393n, 5232499n, 1000001399n, 1600n],
    [23, 3645776n, 5000000n, 999999854n, 11n, 3641767n, 5005000n, 1000001380n, 1526n],
    [24, 3434886n, 5208333n, 999999754n, 12n, 3430785n, 5213541n, 1000001588n, 1834n],
    [25, 3555555n, 5000000n, 999999791n, 12n, 3551617n, 5005000n, 1000001445n, 1654n],
    [26, 3361787n, 5192307n, 999999655n, 13n, 3357770n, 5197499n, 1000001522n, 1867n],
    [27, 3468729n, 4999999n, 999999792n, 13n, 3464861n, 5004998n, 1000001295n, 1503n],
    [28, 3289730n, 5178571n, 999999799n, 14n, 3285794n, 5183749n, 1000001614n, 1815n],
    [29, 3385125n, 4999999n, 999999735n, 14n, 3381324n, 5004998n, 1000001272n, 1537n],
    [30, 3219003n, 5166666n, 999999799n, 15n, 3215144n, 5171832n, 1000001599n, 1800n],
    [31, 3304583n, 4999999n, 999999653n, 15n, 3300848n, 5004998n, 1000001389n, 1736n],
    [32, 3149791n, 5156250n, 999999799n, 16n, 3146005n, 5161406n, 1000001553n, 1754n],
];

const benchLadder = (n: number): TLadder => ({
  bands: Array.from({ length: n }, (_, i) => ({
    start: { num: 1_000_000n + 10_000n * BigInt(i), den },
    weight: 1n,
    curve: 0 as const,
    feeBuy: fee,
    feeSell: fee,
  })),
  closing: { num: 1_000_000n + 10_000n * BigInt(n), den },
  weightTotal: BigInt(n),
});

describe("BandedConcentratedLiquidityPool: the scaling bench vectors", () => {
  for (const [n, a, b, x, k, a1, b1] of benchRows) {
    it(`pays ${a - a1} A for ${b1 - b} B on ${n} bands`, () => {
      const ladder = benchLadder(n);
      const w = findWitness(ladder, a, b)!;
      expect(w.x).toBe(x);
      expect(BigInt(w.k)).toBe(k);
      const out = getSwapOutput(tokenB, b1 - b, a, b, ladder, false, w);
      expect(out.output).toBe(a - a1);
    });
  }
});
