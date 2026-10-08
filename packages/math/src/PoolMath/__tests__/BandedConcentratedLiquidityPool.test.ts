import { describe, expect, it } from "bun:test";
import { IAssetAmountMetadata } from "@sundaeswap/asset";

import {
  aSat,
  bandOf,
  bandProof,
  bandStates,
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

  it("pays 616 A for 624 B, as the chain and the scooper do", () => {
    const out = getSwapOutput(tokenB, 624n, A, B, eq8, false);
    expect(out.output).toBe(616n);
    expect(out.lpFee.amount).toBe(1n);
    expect(out.steps.length).toBe(1);
  });

  it("recovers from a stale hint", () => {
    const out = getSwapOutput(tokenB, 624n, A, B, eq8, false, { x: 123n, k: 5 });
    expect(out.output).toBe(616n);
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
