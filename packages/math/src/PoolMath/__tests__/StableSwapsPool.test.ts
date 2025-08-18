import {
  getNewY,
  getPrice,
  getSumInvariant,
  getSwapOutput,
  liquidityInvariant,
  reservePrecision,
} from "../StableSwapsPool.js";
import { TPair } from "../SharedPoolMath.js";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";

describe("liquidityInvariant()", () => {
  test("Should be true for normal balanced case", () => {
    expect(
      liquidityInvariant(
        20_000_000n * reservePrecision,
        20_000_000n * reservePrecision,
        200n,
        40000000000000000000n,
      ),
    ).toBeTruthy();
  });

  const rawSwap = 9999750604846068206n;

  test("Should be true after a swap", () => {
    expect(
      liquidityInvariant(
        1010000000n * reservePrecision,
        1000000000n * reservePrecision - rawSwap,
        200n,
        2000000000000000000000n,
      ),
    ).toBeTruthy();
  });

  test("Should be false after a swap minus 1", () => {
    expect(
      liquidityInvariant(
        1010000000n * reservePrecision,
        1000000000n * reservePrecision - rawSwap - 1n,
        200n,
        2000000000000000000000n,
      ),
    ).toBeFalsy();
  });

  test("Should be false after a swap plus 1", () => {
    expect(
      liquidityInvariant(
        1010000000n * reservePrecision,
        1000000000n * reservePrecision - rawSwap + 1n,
        200n,
        2000000000000000000000n,
      ),
    ).toBeFalsy();
  });
});

describe("getSumInvariant()", () => {
  test("Should return correct in balanced case", () => {
    expect(getSumInvariant(200n, 20_000_000n, 20_000_000n)).toEqual(
      40000000000000000000n,
    );
  });
  test("Should return correct in unbalanced case", () => {
    expect(getSumInvariant(200n, 1010000000n, 1000000000n - 9999750n)).toEqual(
      2000000000604861229903n,
    );
  });
});

describe("getNewY()", () => {
  const sumInvariant = 2000000000000000000000n;
  const rawSwap = 9999750604846068206n;
  const newX = 1010000000n;
  const oldY = 1000000000n;
  test("Should find the correct swap amount", () => {
    const newY = getNewY(newX, 200n, sumInvariant);
    expect(newY).toEqual(oldY * reservePrecision - rawSwap);
  });
});

describe("getPrice()", () => {
  test("Should return a price of 1 for a balanced pool", () => {
    const price = getPrice(20_000_000n, 20_000_000n, 200n);
    expect(price.toNumber()).toEqual(1.0);
  });

  test("Should give a price closer to 1 than normal cpp for unbalanced pool", () => {
    const aReserve = 1010000000n;
    const bReserve = 1000000000n - 9999750n;
    const stablePrice = getPrice(aReserve, bReserve, 200n);
    const normalCppPrice = new Fraction(aReserve, bReserve);
    expect(Math.abs(stablePrice.toNumber() - 1.0)).toBeLessThan(
      Math.abs(normalCppPrice.toNumber() - 1.0),
    );
  });
});

describe("getSwapOutput()", () => {
  const zeroThreePct = new Fraction(3, 1000);
  const onePct = new Fraction(1, 100);
  const zeroPct = Fraction.ZERO;
  const laf = 1000n;

  test("throws if any of the arguments are negative", () => {
    expect(() =>
      getSwapOutput(-1n, 10n, 10n, Fraction.ZERO, Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(1n, -10n, 10n, Fraction.ZERO, Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(1n, 10n, -10n, Fraction.ZERO, Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(1n, 1n, 1n, Fraction.asFraction(-0.1), Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(1n, 1n, 1n, Fraction.ZERO, Fraction.asFraction(-0.1), laf),
    ).toThrow();
  });

  test("throws if combined fee is greater than 1", () => {
    expect(() =>
      getSwapOutput(
        1n,
        10000n,
        10000n,
        Fraction.asFraction(0.5),
        Fraction.asFraction(0.4),
        laf,
      ),
    ).not.toThrow();
    expect(() =>
      getSwapOutput(
        1n,
        10000n,
        10000n,
        Fraction.asFraction(0.632),
        Fraction.asFraction(0.5),
        laf,
      ),
    ).toThrow();
  });

  test("rounds up for non-fractional assets", () => {
    expect(
      getSwapOutput(83n, 10000n, 500n, zeroThreePct, zeroThreePct, laf).output,
    ).toEqual(79n);
    expect(
      getSwapOutput(83n, 10000n, 500n, zeroThreePct, zeroThreePct, laf, true)
        .output,
    ).toEqual(80n);
  });

  test.each([
    // Ideal, 0% pool
    {
      id: 1,
      input: 1n,
      inReserve: [2n, 2n],
      fee: zeroPct,
      out: 0n,
      outReserve: [3n, 2n],
      lpFee: 0n,
      impact: new Fraction(0n, 0n),
    },
    {
      id: 2,
      input: 1n,
      inReserve: [2n, 3n],
      fee: zeroPct,
      out: 1n,
      outReserve: [3n, 2n],
      lpFee: 0n,
      impact: new Fraction(13n, 40000n),
    },
    {
      id: 3,
      input: 100n,
      inReserve: [2n, 3n],
      fee: zeroPct,
      out: 2n,
      outReserve: [102n, 1n],
      lpFee: 0n,
      impact: new Fraction(490003n, 500000n),
    },
    {
      id: 4,
      input: 100n,
      inReserve: [2n, 100n],
      fee: zeroPct,
      out: 99n,
      outReserve: [102n, 1n],
      lpFee: 0n,
      impact: new Fraction(184251n, 1000000n),
    },
    {
      id: 5,
      input: 100n,
      inReserve: [100n, 100n],
      fee: zeroPct,
      out: 98n,
      outReserve: [200n, 2n],
      lpFee: 0n,
      impact: new Fraction(6601n, 250000n),
    },
    {
      id: 6,
      input: 50n,
      inReserve: [100n, 100n],
      fee: zeroPct,
      out: 49n,
      outReserve: [150n, 51n],
      lpFee: 0n,
      impact: new Fraction(6601n, 250000n),
    },

    // Simple boundary cases
    {
      id: 7,
      input: 1n,
      inReserve: [2n, 2n],
      fee: zeroThreePct,
      out: 0n,
      outReserve: [3n, 2n],
      lpFee: 0n,
      impact: new Fraction(0n, 0n),
    },
    {
      id: 8,
      input: 1n,
      inReserve: [2n, 3n],
      fee: zeroThreePct,
      out: 0n,
      outReserve: [3n, 3n],
      lpFee: 0n,
      impact: new Fraction(13n, 40000n),
    },
    {
      id: 9,
      input: 1n,
      inReserve: [2n, 6n],
      fee: zeroThreePct,
      out: 0n,
      outReserve: [3n, 6n],
      lpFee: 0n,
      impact: new Fraction(19n, 15625n),
    },
    {
      id: 10,
      input: 100n,
      inReserve: [2n, 3n],
      fee: zeroThreePct,
      out: 2n,
      outReserve: [102n, 1n],
      lpFee: 0n,
      impact: new Fraction(490003n, 500000n),
    },
    {
      id: 11,
      input: 200n,
      inReserve: [2n, 200n],
      fee: zeroThreePct,
      out: 197n,
      outReserve: [202n, 4n],
      lpFee: 1n,
      impact: new Fraction(460627n, 1000000n),
    },
    {
      id: 12,
      input: 100n,
      inReserve: [100n, 100n],
      fee: zeroThreePct,
      out: 97n,
      outReserve: [200n, 3n],
      lpFee: 0n,
      impact: new Fraction(36339n, 1000000n),
    },
    {
      id: 13,
      input: 50n,
      inReserve: [100n, 100n],
      fee: zeroThreePct,
      out: 49n,
      outReserve: [150n, 51n],
      lpFee: 0n,
      impact: new Fraction(6601n, 250000n),
    },

    // Real world examples
    {
      id: 14,
      input: 1291591603n,
      inReserve: [5753371381n, 672426600000n],
      fee: onePct,
      out: 2139306698n,
      outReserve: [7044962984n, 670309122962n],
      lpFee: 21829660n,
      impact: new Fraction(101761n, 1000000n),
    },
    {
      id: 15,
      input: 1000000n,
      inReserve: [3696260028076n, 77871393827281n],
      fee: zeroThreePct,
      out: 1024032n,
      outReserve: [3696261028076n, 77871392806340n],
      lpFee: 3091n,
      impact: new Fraction(3n, 500n),
    },
  ] as {
    input: bigint;
    inReserve: TPair;
    fee: TFractionLike;
    out: bigint;
    outReserve: TPair;
    lpFee: bigint;
    impact: Fraction;
    id: number;
  }[])(
    "gets the correct swap output, given different inputs (%#)",
    ({ input, inReserve, fee, out, outReserve, lpFee, impact }) => {
      const actual = getSwapOutput(input, ...inReserve, fee, fee, laf);
      expect(actual.output).toBe(out);
      expect(actual.outputLpFee).toBe(lpFee);
      expect(actual.nextInputReserve).toBe(outReserve[0]);
      expect(actual.nextInputReserve).toBe(input + inReserve[0]);
      expect(actual.nextOutputReserve).toBe(outReserve[1]);
      expect(
        actual.nextOutputReserve + actual.output - actual.outputLpFee,
      ).toBe(inReserve[1]);
      expect(actual.priceImpact.toPrecision(6)).toStrictEqual(impact);
    },
  );
});
