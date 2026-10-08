import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";
import type { TSwapOutcome } from "./ConcentratedLiquidityPool.js";

export type { TSwapOutcome };

/**
 * Banded concentrated liquidity: Sundae v4's ladder invariant.
 *
 * A pool is a ladder of bands in ascending sqrt-price order. Each band is a
 * concentrated-liquidity arc (`curve` 0) or a constant-sum bin (`curve` 1)
 * with its own share of the pool's liquidity (`weight / weightTotal`) and
 * its own two fees. LP is one fungible token for the whole ladder; a
 * deposit or withdrawal scales every band.
 *
 * The chain never stores the price. It stores reserves, and the state is a
 * WITNESS `(X, k)`: the ladder counter `X` (the pool's `total_lp`, spec V12)
 * and the active band `k`, which the reserves must prove. Everything here
 * mirrors `lib/modules/banded_cl_check.ak` and the scooper's
 * `banded_math.rs`, rounding included; where they disagree the chain wins
 * and the transaction fails. The rounding is not negotiable:
 *
 *   - `L_k` floors; saturation ceils, in ONE division;
 *   - the prefix sums come from the LADDER INDEX (cumulative coefficients
 *     in fixed point at 2^64, spec §2.3), multiplied by the counter and
 *     ceiled ONCE. A per-band sum of ceilings is a different number and the
 *     chain rejects it.
 */

/** An exact rational `num / den`. */
export type TFrac = { num: bigint; den: bigint };

/** One band of the ladder. */
export type TBand = {
  /** The band's LOWER sqrt-price edge. The next band's `start` is its upper edge. */
  start: TFrac;
  /** The band's share of the ladder's liquidity counter. */
  weight: bigint;
  /** 0 = concentrated-liquidity arc, 1 = constant-sum bin. */
  curve: 0 | 1;
  /** Fee on swaps that buy the pool's first asset (B in). */
  feeBuy: TFrac;
  /** Fee on swaps that sell the pool's first asset (A in). */
  feeSell: TFrac;
};

/** A ladder: bands, the top edge, and the sum of the weights. */
export type TLadder = {
  bands: TBand[];
  /** The last band's UPPER sqrt-price edge. */
  closing: TFrac;
  weightTotal: bigint;
};

/** The witness the chain checks: the ladder counter and the active band. */
export type TWitness = { x: bigint; k: number };

/** 2^64, the fixed-point scale of the ladder index. */
export const FIXED_ONE = 1n << 64n;

const ceilDiv = (n: bigint, d: bigint): bigint => (n + d - 1n) / d;

/** Band i's upper sqrt-price edge. */
export const upperEdge = (l: TLadder, i: number): TFrac =>
  i + 1 < l.bands.length ? l.bands[i + 1]!.start : l.closing;

/** `D_i = hi.num·lo.den − lo.num·hi.den`: positive exactly when the edges increase. */
export const delta = (lo: TFrac, hi: TFrac): bigint =>
  hi.num * lo.den - lo.num * hi.den;

/** `a_sat_i = ceil(w_i·X·D_i / (W·lo.num·hi.num))`: the A a band above the price holds. */
export const aSat = (l: TLadder, x: bigint, i: number): bigint => {
  const lo = l.bands[i]!.start;
  const hi = upperEdge(l, i);
  return ceilDiv(
    l.bands[i]!.weight * x * delta(lo, hi),
    l.weightTotal * lo.num * hi.num,
  );
};

/** `b_sat_i = ceil(w_i·X·D_i / (W·lo.den·hi.den))`: the B a band below the price holds. */
export const bSat = (l: TLadder, x: bigint, i: number): bigint => {
  const lo = l.bands[i]!.start;
  const hi = upperEdge(l, i);
  return ceilDiv(
    l.bands[i]!.weight * x * delta(lo, hi),
    l.weightTotal * lo.den * hi.den,
  );
};

/** `L_k = floor(w_k·X / W)`. */
export const liquidityOf = (l: TLadder, x: bigint, k: number): bigint =>
  (l.bands[k]!.weight * x) / l.weightTotal;

/** Band i's A-side saturation coefficient: the part of `a_sat_i` independent of X, rounded up. */
export const coeffA = (l: TLadder, i: number): bigint => {
  const lo = l.bands[i]!.start;
  const hi = upperEdge(l, i);
  return ceilDiv(
    l.bands[i]!.weight * delta(lo, hi) * FIXED_ONE,
    l.weightTotal * lo.num * hi.num,
  );
};

/** The same on the B side. */
export const coeffB = (l: TLadder, i: number): bigint => {
  const lo = l.bands[i]!.start;
  const hi = upperEdge(l, i);
  return ceilDiv(
    l.bands[i]!.weight * delta(lo, hi) * FIXED_ONE,
    l.weightTotal * lo.den * hi.den,
  );
};

/** One index entry: the cumulative coefficients above and below band k. */
export type TIndexEntry = { ca: bigint; cb: bigint };

/**
 * The ladder index `Create` pins and every spend reads: entry k is the pair
 * of cumulative coefficients for the bands strictly above and strictly
 * below band k. `banded_cl_check.build_index`, to the digit.
 */
export const buildIndex = (l: TLadder): TIndexEntry[] => {
  const n = l.bands.length;
  const a = Array.from({ length: n }, (_, i) => coeffA(l, i));
  const b = Array.from({ length: n }, (_, i) => coeffB(l, i));
  const out: TIndexEntry[] = [];
  for (let k = 0; k < n; k++) {
    let ca = 0n;
    let cb = 0n;
    for (let i = 0; i < n; i++) {
      if (i > k) ca += a[i]!;
      if (i < k) cb += b[i]!;
    }
    out.push({ ca, cb });
  }
  return out;
};

/**
 * A ladder with its index built once. Every probe of the witness search
 * reads the index for every band, and rebuilding it per probe is most of
 * the cost of a quote.
 */
export type TIndexedLadder = TLadder & { index: TIndexEntry[] };

export const indexLadder = (l: TLadder): TIndexedLadder =>
  "index" in l && Array.isArray((l as TIndexedLadder).index)
    ? (l as TIndexedLadder)
    : { ...l, index: buildIndex(l) };

/** `C_A`, `C_B` at (X, k) from the index: one ceiling after the multiply by X. */
export const prefixes = (
  l: TIndexedLadder,
  x: bigint,
  k: number,
): { ca: bigint; cb: bigint } => {
  const e = l.index[k]!;
  return { ca: ceilDiv(e.ca * x, FIXED_ONE), cb: ceilDiv(e.cb * x, FIXED_ONE) };
};

/** `cl_check.f_at_raw`: the CL arc, cross-multiplied. */
const fAt = (a: bigint, b: bigint, L: bigint, lo: TFrac, hi: TFrac): bigint =>
  (a * hi.num + L * hi.den) * (b * lo.den + L * lo.num) -
  L * L * hi.num * lo.den;

/** G at a witness, on whichever curve the active band carries. */
const gAt = (
  l: TIndexedLadder,
  A: bigint,
  B: bigint,
  x: bigint,
  k: number,
): bigint => {
  const { ca, cb } = prefixes(l, x, k);
  const lo = l.bands[k]!.start;
  const hi = upperEdge(l, k);
  const ra = A - ca;
  const rb = B - cb;
  const L = liquidityOf(l, x, k);
  return l.bands[k]!.curve === 0
    ? fAt(ra, rb, L, lo, hi)
    : ra * (lo.num * hi.num) + rb * (lo.den * hi.den) - L * delta(lo, hi);
};

/** The band proof, P1 through P7. The chain runs exactly this. */
export const bandProof = (
  l: TIndexedLadder,
  A: bigint,
  B: bigint,
  x: bigint,
  k: number,
): boolean => {
  if (x < l.weightTotal) return false; // P1
  const { ca, cb } = prefixes(l, x, k);
  const ra = A - ca;
  const rb = B - cb;
  if (ra < 0n || rb < 0n) return false; // P2, P3
  if (ra > aSat(l, x, k) || rb > bSat(l, x, k)) return false; // P4, P5
  if (gAt(l, A, B, x, k) < 0n) return false; // P6
  return gAt(l, A, B, x + 1n, k) < 0n; // P7
};

const SCAN = 400n;
const CAP = 1n << 80n;

/**
 * The witness in band k, seeded at `hint` when given: the counter only
 * grows along a swap, so the doubling search starts from the previous
 * witness. `lo` is the largest x with non-negative residuals and G ≥ 0,
 * and a witness is such an x whose successor fails G, so the scan walks
 * DOWN from `lo` first. Mirrors `banded_math::find_witness_in_band_from`.
 */
export const findWitnessInBand = (
  l: TIndexedLadder,
  A: bigint,
  B: bigint,
  k: number,
  hint?: bigint,
): TWitness | null => {
  const ok = (x: bigint): boolean => {
    const { ca, cb } = prefixes(l, x, k);
    return A - ca >= 0n && B - cb >= 0n && gAt(l, A, B, x, k) >= 0n;
  };
  const search = (start: bigint): TWitness | null => {
    let lo = start;
    let span = 1n;
    let hi = lo + span;
    while (ok(hi) && hi < CAP) {
      lo = hi;
      span *= 2n;
      hi = lo + span;
    }
    while (lo + 1n < hi) {
      const m = (lo + hi) / 2n;
      if (ok(m)) lo = m;
      else hi = m;
    }
    const from = lo > SCAN ? lo - SCAN : 1n;
    for (let x = lo; x >= from; x--) {
      if (bandProof(l, A, B, x, k)) return { x, k };
    }
    for (let x = lo + 1n; x <= lo + SCAN; x++) {
      if (bandProof(l, A, B, x, k)) return { x, k };
    }
    return null;
  };
  if (hint !== undefined && hint > 0n && ok(hint)) {
    const w = search(hint);
    if (w) return w;
  }
  if (!ok(1n)) return null;
  return search(1n);
};

/**
 * The witness `(X, k)` for a pool's reserves. A hint (the indexed
 * `bandCounter` / `activeBand`) is checked first and seeds the search in
 * its band; a stale hint falls back to every band. Null when the reserves
 * sit on no point of the ladder — the chain would reject them too.
 */
export const findWitness = (
  ladder: TLadder,
  A: bigint,
  B: bigint,
  hint?: TWitness,
): TWitness | null => {
  const l = indexLadder(ladder);
  if (hint && hint.k >= 0 && hint.k < l.bands.length) {
    if (bandProof(l, A, B, hint.x, hint.k)) return hint;
    const w = findWitnessInBand(l, A, B, hint.k, hint.x);
    if (w) return w;
  }
  for (let k = 0; k < l.bands.length; k++) {
    const w = findWitnessInBand(l, A, B, k);
    if (w) return w;
  }
  return null;
};

/** The active band's view at a witness: its residual reserves and liquidity. */
export type TBandView = {
  ra: bigint;
  rb: bigint;
  l: bigint;
  lo: TFrac;
  hi: TFrac;
  curve: 0 | 1;
  feeBuy: TFrac;
  feeSell: TFrac;
};

export const bandView = (
  l: TIndexedLadder,
  A: bigint,
  B: bigint,
  w: TWitness,
): TBandView => {
  const { ca, cb } = prefixes(l, w.x, w.k);
  const band = l.bands[w.k]!;
  return {
    ra: A - ca,
    rb: B - cb,
    l: liquidityOf(l, w.x, w.k),
    lo: band.start,
    hi: upperEdge(l, w.k),
    curve: band.curve,
    feeBuy: band.feeBuy,
    feeSell: band.feeSell,
  };
};

/** The band's fee for a direction: `feeSell` when A is sold, `feeBuy` when A is bought. */
export const feeFor = (v: TBandView, isAInput: boolean): TFrac =>
  isAInput ? v.feeSell : v.feeBuy;

/** The output one band pays for `dx` within itself. Mirrors `banded_math::band_output`. */
export const bandOutput = (
  v: TBandView,
  isAInput: boolean,
  dx: bigint,
): bigint => {
  const fee = feeFor(v, isAInput);
  if (fee.den <= 0n) return 0n;
  const dxEff = dx - (dx * fee.num) / fee.den;
  if (dxEff <= 0n) return 0n;
  if (v.curve === 0) {
    const va0 = v.ra * v.hi.num + v.l * v.hi.den;
    const vb0 = v.rb * v.lo.den + v.l * v.lo.num;
    if (isAInput) {
      const dva = dxEff * v.hi.num;
      const den = (va0 + dva) * v.lo.den;
      return den === 0n ? 0n : (vb0 * dva) / den;
    }
    const dvb = dxEff * v.lo.den;
    const den = (vb0 + dvb) * v.hi.num;
    return den === 0n ? 0n : (va0 * dvb) / den;
  }
  const pn = v.lo.num * v.hi.num;
  const pd = v.lo.den * v.hi.den;
  return isAInput ? (dxEff * pn) / pd : (dxEff * pd) / pn;
};

/** What the band can pay out in a direction: its residual of the output asset. */
export const bandCapacity = (v: TBandView, isAInput: boolean): bigint =>
  isAInput ? v.rb : v.ra;

/** The largest input whose output stays within the band. */
export const maxDxInBand = (v: TBandView, isAInput: boolean): bigint => {
  const cap = bandCapacity(v, isAInput);
  if (cap <= 0n) return 0n;
  const fits = (dx: bigint) => bandOutput(v, isAInput, dx) <= cap;
  let hi = 1n;
  for (let guard = 0; fits(hi); guard++) {
    hi *= 2n;
    if (guard > 200) return hi;
  }
  let lo = 0n;
  while (lo + 1n < hi) {
    const m = (lo + hi) / 2n;
    if (fits(m)) lo = m;
    else hi = m;
  }
  return lo;
};

/** The next band a fill enters: selling A walks down the ladder, buying A walks up. */
export const nextBand = (
  k: number,
  isAInput: boolean,
  n: number,
): number | null =>
  isAInput ? (k === 0 ? null : k - 1) : k + 1 >= n ? null : k + 1;

/** One band of a fill: what it paid, and the state it left. */
export type TFillStep = {
  band: number;
  input: bigint;
  output: bigint;
  after: TWitness;
};

/**
 * Price `dx` across as many bands as it takes, as the scooper's
 * `swap_steps` does: fill the active band, cross to the next, repeat.
 * Returns the steps, or null when the ladder cannot absorb `dx` (the
 * direction is exhausted, or the remainder pays nothing).
 */
export const swapSteps = (
  ladder: TLadder,
  A: bigint,
  B: bigint,
  isAInput: boolean,
  dx: bigint,
  hint?: TWitness,
): TFillStep[] | null => {
  const l = indexLadder(ladder);
  const n = l.bands.length;
  let ca = A;
  let cb = B;
  let remaining = dx;
  const steps: TFillStep[] = [];
  let known: TWitness | null = findWitness(l, A, B, hint);
  if (!known) return null;
  let prefer: number | null = null;
  let hintX: bigint | undefined;
  for (let guard = 0; remaining > 0n; guard++) {
    if (guard > 2 * n + 2) return null;
    let before: TWitness | null = known;
    known = null;
    if (!before) {
      if (prefer !== null) before = findWitnessInBand(l, ca, cb, prefer, hintX);
      if (!before) before = findWitness(l, ca, cb);
      if (!before) return null;
    }
    const view = bandView(l, ca, cb, before);
    const capDx = maxDxInBand(view, isAInput);
    const stepDx = capDx < remaining ? capDx : remaining;
    const dy = stepDx > 0n ? bandOutput(view, isAInput, stepDx) : 0n;
    if (dy <= 0n) {
      const kNext = nextBand(before.k, isAInput, n);
      if (kNext === null || prefer === kNext) return null;
      prefer = kNext;
      continue;
    }
    const na = isAInput ? ca + stepDx : ca - dy;
    const nb = isAInput ? cb - dy : cb + stepDx;
    const crossing = stepDx < remaining;
    let after: TWitness | null = null;
    if (crossing) {
      const kNext = nextBand(before.k, isAInput, n);
      if (kNext !== null) after = findWitnessInBand(l, na, nb, kNext, before.x);
    } else {
      after = findWitnessInBand(l, na, nb, before.k, before.x);
    }
    if (!after) after = findWitness(l, na, nb);
    if (!after || after.x < before.x) return null;
    steps.push({ band: before.k, input: stepDx, output: dy, after });
    remaining -= stepDx;
    ca = na;
    cb = nb;
    prefer = after.k;
    hintX = after.x;
    known = after;
  }
  return steps;
};

/**
 * The swap output of a banded pool for `input` of one asset, crossing
 * bands as needed. `aReserve`/`bReserve` are the pool's reserves in
 * canonical order; `hint` is the indexed `bandCounter` / `activeBand`,
 * which seeds the witness search and may be stale.
 *
 * The `lpFee` is the fee the bands kept of the input, summed across the
 * steps. `priceImpact` is against the active band's opening marginal
 * price. Throws when the ladder cannot absorb the input.
 */
export const getSwapOutput = (
  inputMetadata: IAssetAmountMetadata,
  input: bigint,
  aReserve: bigint,
  bReserve: bigint,
  ladder: TLadder,
  isAInput: boolean,
  hint?: TWitness,
): TSwapOutcome & { steps: TFillStep[] } => {
  if (input <= 0n || aReserve < 0n || bReserve < 0n)
    throw new Error("Input must be positive and reserves non-negative");
  if (ladder.bands.length === 0 || ladder.weightTotal <= 0n)
    throw new Error("The ladder has no bands");
  const l = indexLadder(ladder);
  const steps = swapSteps(l, aReserve, bReserve, isAInput, input, hint);
  if (!steps || steps.length === 0)
    throw new Error("The ladder cannot absorb this input in this direction");
  let output = 0n;
  let lpFee = 0n;
  for (const s of steps) {
    output += s.output;
    const band = l.bands[s.band]!;
    const fee = isAInput ? band.feeSell : band.feeBuy;
    lpFee += (s.input * fee.num) / fee.den;
  }
  const inputReserve = isAInput ? aReserve : bReserve;
  const outputReserve = isAInput ? bReserve : aReserve;
  if (output > outputReserve) output = outputReserve;
  // Price impact against the opening marginal of the first band traded.
  const w0 = findWitness(l, aReserve, bReserve, hint)!;
  const v0 = bandView(l, aReserve, bReserve, w0);
  let priceImpact = Fraction.ZERO;
  if (output > 0n) {
    let ideal: Fraction;
    if (v0.curve === 1) {
      const pn = v0.lo.num * v0.hi.num;
      const pd = v0.lo.den * v0.hi.den;
      ideal = isAInput ? new Fraction(pd, pn) : new Fraction(pn, pd);
    } else {
      const va0 = v0.ra * v0.hi.num + v0.l * v0.hi.den;
      const vb0 = v0.rb * v0.lo.den + v0.l * v0.lo.num;
      ideal = isAInput
        ? new Fraction(va0 * v0.lo.den, vb0 * v0.hi.num)
        : new Fraction(vb0 * v0.hi.num, va0 * v0.lo.den);
    }
    const actual = new Fraction(input - lpFee, output);
    priceImpact = Fraction.ONE.subtract(ideal.divide(actual));
  }
  return {
    input,
    output,
    lpFee: new AssetAmount(lpFee, inputMetadata),
    nextInputReserve: inputReserve + input,
    nextOutputReserve: outputReserve - output,
    priceImpact,
    steps,
  };
};

/** What each band holds at the pool's reserves. */
export type TBandState = {
  /** The band's reserves in canonical order. The bands sum to the pool's reserves. */
  quantities: [bigint, bigint];
  liquidity: bigint;
  active: boolean;
};

/**
 * Every band's state at the pool's reserves: a band below the price holds
 * only B, a band above it only A, the active band some of both. Null when
 * the reserves sit on no point of the ladder.
 */
export const bandStates = (
  ladder: TLadder,
  aReserve: bigint,
  bReserve: bigint,
  hint?: TWitness,
): TBandState[] | null => {
  const l = indexLadder(ladder);
  const w = findWitness(l, aReserve, bReserve, hint);
  if (!w) return null;
  const out: TBandState[] = [];
  let restA = 0n;
  let restB = 0n;
  for (let i = 0; i < l.bands.length; i++) {
    const liquidity = liquidityOf(l, w.x, i);
    if (i < w.k) {
      const b = bSat(l, w.x, i);
      restB += b;
      out.push({ quantities: [0n, b], liquidity, active: false });
    } else if (i > w.k) {
      const a = aSat(l, w.x, i);
      restA += a;
      out.push({ quantities: [a, 0n], liquidity, active: false });
    } else {
      out.push({ quantities: [0n, 0n], liquidity, active: true });
    }
  }
  const ra = aReserve - restA;
  const rb = bReserve - restB;
  out[w.k]!.quantities = [ra < 0n ? 0n : ra, rb < 0n ? 0n : rb];
  return out;
};

/** Which band holds a sqrt-price. */
export const bandOf = (l: TLadder, s: TFrac): number => {
  for (let i = 0; i < l.bands.length; i++) {
    const hi = upperEdge(l, i);
    if (s.num * hi.den < hi.num * s.den) return i;
  }
  return l.bands.length - 1;
};

/**
 * The exact reserves a ladder holds at counter `x` with the price at
 * sqrt-price `s`, which must lie in band `k`: what a pool creator deposits
 * for a chosen shape, scale and launch price. The result is floored, so
 * `findWitness` must still be run on it to learn the counter the chain
 * derives — usually `x`, but rounding can move it.
 */
export const reservesAt = (
  l: TLadder,
  x: bigint,
  k: number,
  s: TFrac,
): { A: bigint; B: bigint } => {
  let A = 0n;
  let B = 0n;
  for (let i = 0; i < l.bands.length; i++) {
    if (i > k) {
      A += aSat(l, x, i);
      continue;
    }
    if (i < k) {
      B += bSat(l, x, i);
      continue;
    }
    const lo = l.bands[i]!.start;
    const hi = upperEdge(l, i);
    const L = liquidityOf(l, x, i);
    if (l.bands[i]!.curve === 1) {
      // A constant-sum bin prices at the geometric mean; `s` only says how
      // far through the bin the conversion has gone.
      const K = L * delta(lo, hi);
      const frac = (s.num * lo.den - lo.num * s.den) * hi.den;
      const span = (hi.num * lo.den - lo.num * hi.den) * s.den;
      const rb = (K * frac) / (span * (lo.den * hi.den));
      A += (K - rb * (lo.den * hi.den)) / (lo.num * hi.num);
      B += rb;
    } else {
      // a = L·(1/s − 1/hi), b = L·(s − lo), in exact rationals.
      A += (L * (s.den * hi.num - s.num * hi.den)) / (s.num * hi.num);
      B += (L * (s.num * lo.den - lo.num * s.den)) / (s.den * lo.den);
    }
  }
  return { A, B };
};

/** A fraction in lowest terms. */
const reduceFrac = (f: TFrac): TFrac => {
  const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
  const g = gcd(f.num < 0n ? -f.num : f.num, f.den);
  return g > 1n ? { num: f.num / g, den: f.den / g } : f;
};

/**
 * An equal-weight ladder of `n` bands from `lo` to `hi`, every band a CL
 * arc at `fee` unless named in `curves`. The edges are built over a common
 * denominator and reduced: every rational component of a banded config
 * must stay below 2^64 (spec V9).
 */
export const uniformLadder = (
  n: number,
  lo: TFrac,
  hi: TFrac,
  fee: TFrac,
  curves: (0 | 1)[] = [],
): TLadder => {
  if (n < 1) throw new Error("A ladder needs at least one band");
  if (lo.num * hi.den >= hi.num * lo.den)
    throw new Error("The lower edge must be strictly below the upper edge");
  const span = hi.num * lo.den - lo.num * hi.den;
  const commonDen = lo.den * hi.den * BigInt(n);
  const bands: TBand[] = [];
  for (let i = 0; i < n; i++) {
    bands.push({
      start: reduceFrac({
        num: lo.num * hi.den * BigInt(n) + span * BigInt(i),
        den: commonDen,
      }),
      weight: 1n,
      curve: curves[i] ?? 0,
      feeBuy: fee,
      feeSell: fee,
    });
  }
  return {
    bands,
    closing: reduceFrac({
      num: lo.num * hi.den * BigInt(n) + span * BigInt(n),
      den: commonDen,
    }),
    weightTotal: BigInt(n),
  };
};

/** Band weight profiles. Every weight is at least 1, as `Create` demands. */
export type TWeightShape =
  | "flat"
  | "concentrated"
  | "skewed-low"
  | "skewed-high"
  | "bimodal";

export const bandWeights = (
  n: number,
  shape: TWeightShape = "concentrated",
  opts: { centre?: number; peak?: bigint; tail?: bigint } = {},
): bigint[] => {
  if (shape === "flat") return Array.from({ length: n }, () => 1n);
  const peak = Number(opts.peak ?? 64n);
  const tail = Number(opts.tail ?? 1n);
  const centre = opts.centre ?? (n - 1) / 2;
  const sigma = Math.max(n / 5, 0.75);
  const bell = (i: number, c: number) => Math.exp(-(((i - c) / sigma) ** 2));
  const profile = (i: number): number => {
    switch (shape) {
      case "concentrated":
        return bell(i, centre);
      case "skewed-low":
        return Math.exp(-i / Math.max(n / 3, 1));
      case "skewed-high":
        return Math.exp(-(n - 1 - i) / Math.max(n / 3, 1));
      case "bimodal":
        return Math.max(bell(i, (n - 1) / 4), bell(i, (3 * (n - 1)) / 4));
      default:
        return 1;
    }
  };
  return Array.from({ length: n }, (_, i) => {
    const w = Math.round(tail + (peak - tail) * profile(i));
    return BigInt(Math.max(1, w));
  });
};

/**
 * A ladder of `n` bands from `lo` to `hi` with a weight shape, optional
 * constant-sum bins and an optional per-band fee. The edges are
 * `uniformLadder`'s exactly; only the weights, curves and fees differ.
 */
export const shapedLadder = (
  n: number,
  lo: TFrac,
  hi: TFrac,
  fee: TFrac,
  opts: {
    shape?: TWeightShape;
    centre?: number;
    peak?: bigint;
    tail?: bigint;
    /** Zero-based band indices to price as constant-sum bins. */
    csBands?: number[];
    /** Overrides `fee` per band. */
    feeAt?: (i: number) => TFrac;
  } = {},
): TLadder => {
  const base = uniformLadder(n, lo, hi, fee);
  const weights = bandWeights(n, opts.shape ?? "concentrated", opts);
  const cs = new Set(opts.csBands ?? []);
  const bands: TBand[] = base.bands.map((b, i) => {
    const f = opts.feeAt ? opts.feeAt(i) : fee;
    return {
      ...b,
      weight: weights[i]!,
      curve: cs.has(i) ? 1 : 0,
      feeBuy: f,
      feeSell: f,
    };
  });
  return {
    bands,
    closing: base.closing,
    weightTotal: weights.reduce((s, w) => s + w, 0n),
  };
};
