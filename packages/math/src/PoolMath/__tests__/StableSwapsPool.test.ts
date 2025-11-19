import {
  getNewY,
  getPrice,
  getSumInvariant,
  getSwapInput,
  getSwapOutput,
  liquidityInvariant,
  RESERVE_PRECISION,
} from "../StableSwapsPool.js";
import { TPair } from "../SharedPoolMath.js";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";
import { IAssetAmountMetadata } from "@sundaeswap/asset";

const usdc: IAssetAmountMetadata = {
  assetId: "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.55534443",
  decimals: 6,
};

describe("liquidityInvariant()", () => {
  test("Should be true for normal balanced case", () => {
    expect(
      liquidityInvariant(
        20_000_000n * RESERVE_PRECISION,
        20_000_000n * RESERVE_PRECISION,
        200n,
        40000000000000000000n,
      ),
    ).toBeTruthy();
  });

  const rawSwap = 9999750604846068206n;

  test("Should be true after a swap", () => {
    expect(
      liquidityInvariant(
        1010000000n * RESERVE_PRECISION,
        1000000000n * RESERVE_PRECISION - rawSwap,
        200n,
        2000000000000000000000n,
      ),
    ).toBeTruthy();
  });

  test("Should be false after a swap minus 1", () => {
    expect(
      liquidityInvariant(
        1010000000n * RESERVE_PRECISION,
        1000000000n * RESERVE_PRECISION - rawSwap - 1n,
        200n,
        2000000000000000000000n,
      ),
    ).toBeFalsy();
  });

  test("Should be false after a swap plus 1", () => {
    expect(
      liquidityInvariant(
        1010000000n * RESERVE_PRECISION,
        1000000000n * RESERVE_PRECISION - rawSwap + 1n,
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
    expect(newY).toEqual(oldY * RESERVE_PRECISION - rawSwap);
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

describe("getSwapOutput(usdc,)", () => {
  const zeroThreePct = new Fraction(3, 1000);
  const onePct = new Fraction(1, 100);
  const zeroPct = Fraction.ZERO;
  const laf = 1000n;

  test("throws if any of the arguments are negative", () => {
    expect(() =>
      getSwapOutput(usdc, -1n, 10n, 10n, Fraction.ZERO, Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(usdc, 1n, -10n, 10n, Fraction.ZERO, Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(usdc, 1n, 10n, -10n, Fraction.ZERO, Fraction.ZERO, laf),
    ).toThrow();
    expect(() =>
      getSwapOutput(
        usdc,
        1n,
        1n,
        1n,
        Fraction.asFraction(-0.1),
        Fraction.ZERO,
        laf,
      ),
    ).toThrow();
    expect(() =>
      getSwapOutput(
        usdc,
        1n,
        1n,
        1n,
        Fraction.ZERO,
        Fraction.asFraction(-0.1),
        laf,
      ),
    ).toThrow();
  });

  test("throws if combined fee is greater than 1", () => {
    expect(() =>
      getSwapOutput(
        usdc,
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
        usdc,
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
      getSwapOutput(usdc, 83n, 10000n, 500n, zeroThreePct, zeroThreePct, laf)
        .output,
    ).toEqual(79n);
    expect(
      getSwapOutput(
        usdc,
        83n,
        10000n,
        500n,
        zeroThreePct,
        zeroThreePct,
        laf,
        true,
      ).output,
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
      impact: new Fraction(249n, 1000000n),
    },
    {
      id: 3,
      input: 100n,
      inReserve: [2n, 3n],
      fee: zeroPct,
      out: 2n,
      outReserve: [102n, 1n],
      lpFee: 0n,
      impact: new Fraction(245001n, 250000n),
    },
    {
      id: 4,
      input: 100n,
      inReserve: [2n, 100n],
      fee: zeroPct,
      out: 99n,
      outReserve: [102n, 1n],
      lpFee: 0n,
      impact: new Fraction(244453n, 1000000n),
    },
    {
      id: 5,
      input: 100n,
      inReserve: [100n, 100n],
      fee: zeroPct,
      out: 98n,
      outReserve: [200n, 2n],
      lpFee: 0n,
      impact: new Fraction(1n, 50n),
    },
    {
      id: 6,
      input: 50n,
      inReserve: [100n, 100n],
      fee: zeroPct,
      out: 49n,
      outReserve: [150n, 51n],
      lpFee: 0n,
      impact: new Fraction(1n, 50n),
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
      lpFee: 1n,
      impact: new Fraction(249n, 1000000n),
    },
    {
      id: 9,
      input: 1n,
      inReserve: [2n, 6n],
      fee: zeroThreePct,
      out: 0n,
      outReserve: [3n, 6n],
      lpFee: 1n,
      impact: new Fraction(499n, 1000000n),
    },
    {
      id: 10,
      input: 100n,
      inReserve: [2n, 3n],
      fee: zeroThreePct,
      out: 1n,
      outReserve: [102n, 2n],
      lpFee: 1n,
      impact: new Fraction(495001n, 500000n),
    },
    {
      id: 11,
      input: 200n,
      inReserve: [2n, 200n],
      fee: zeroThreePct,
      out: 196n,
      outReserve: [202n, 3n],
      lpFee: 1n,
      impact: new Fraction(559n, 1000n),
    },
    {
      id: 12,
      input: 100n,
      inReserve: [100n, 100n],
      fee: zeroThreePct,
      out: 97n,
      outReserve: [200n, 3n],
      lpFee: 1n,
      impact: new Fraction(3n, 100n),
    },
    {
      id: 13,
      input: 50n,
      inReserve: [100n, 100n],
      fee: zeroThreePct,
      out: 48n,
      outReserve: [150n, 52n],
      lpFee: 1n,
      impact: new Fraction(1n, 25n),
    },

    // Real world examples
    {
      id: 14,
      input: 1291591603n,
      inReserve: [5753371381n, 672426600000n],
      fee: onePct,
      out: 2139306697n,
      outReserve: [7044962984n, 670265463643n],
      lpFee: 21829661n,
      impact: new Fraction(380983n, 1000000n),
    },
    {
      id: 15,
      input: 1000000n,
      inReserve: [3696260028076n, 77871393827281n],
      fee: zeroThreePct,
      out: 1024031n,
      outReserve: [3696261028076n, 77871392800159n],
      lpFee: 3091n,
      impact: new Fraction(34239n, 1000000n),
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
      const actual = getSwapOutput(usdc, input, ...inReserve, fee, fee, laf);
      expect(actual.output).toBe(out);
      expect(actual.lpFee.amount).toBe(lpFee);
      expect(actual.nextInputReserve).toBe(outReserve[0]);
      expect(actual.nextInputReserve).toBe(input + inReserve[0]);
      expect(actual.nextOutputReserve).toBe(outReserve[1]);
      expect(
        actual.nextOutputReserve + actual.output + actual.protocolFee.amount,
      ).toBe(inReserve[1]);
      expect(actual.priceImpact.toPrecision(6)).toStrictEqual(impact);
    },
  );
});

describe("getSwapInput", () => {
  const fivePct = new Fraction(5, 100);
  const threePct = new Fraction(3, 100);
  const onePct = new Fraction(1, 100);
  const zeroPct = Fraction.ZERO;

  test("throws if any of the arguments are negative", () => {
    expect(() =>
      getSwapInput(usdc, -1n, 10n, 10n, Fraction.ZERO, Fraction.ZERO, 1000n),
    ).toThrow();
    expect(() =>
      getSwapInput(usdc, 1n, -10n, 10n, Fraction.ZERO, Fraction.ZERO, 1000n),
    ).toThrow();
    expect(() =>
      getSwapInput(usdc, 1n, 10n, -10n, Fraction.ZERO, Fraction.ZERO, 1000n),
    ).toThrow();
    expect(() =>
      getSwapInput(
        usdc,
        1n,
        10n,
        10n,
        Fraction.asFraction(-0.1),
        Fraction.ZERO,
        1000n,
      ),
    ).toThrow();
  });

  test("throws if fee is greater than or equal 1", () => {
    expect(() =>
      getSwapInput(
        usdc,
        1n,
        10n,
        10n,
        Fraction.asFraction(1),
        Fraction.ZERO,
        1000n,
      ),
    ).toThrow();
    expect(() =>
      getSwapInput(
        usdc,
        1n,
        10n,
        10n,
        Fraction.asFraction(1.132),
        Fraction.ZERO,
        1000n,
      ),
    ).toThrow();
  });

  test("throws if output is greater than or equal to output reserve", () => {
    expect(() =>
      getSwapInput(
        usdc,
        10n,
        10n,
        10n,
        Fraction.asFraction(0.1),
        Fraction.ZERO,
        1000n,
      ),
    ).toThrow();
    expect(() =>
      getSwapInput(
        usdc,
        1n,
        1n,
        1n,
        Fraction.asFraction(0.1),
        Fraction.ZERO,
        1000n,
      ),
    ).toThrow();
    expect(() =>
      getSwapInput(
        usdc,
        10n,
        1n,
        1n,
        Fraction.asFraction(0.1),
        Fraction.ZERO,
        1000n,
      ),
    ).toThrow();
  });

  test.each([
    // Ideal 0% fee pool
    {
      input: 1n,
      reserves: [1n, 2n],
      fee: zeroPct,
      impact: new Fraction(0n, 2000n),
    },
    {
      input: 100n,
      reserves: [1n, 2n],
      fee: zeroPct,
      impact: new Fraction(0n, 2000n),
    },
    {
      input: 100n,
      reserves: [1n, 100n],
      fee: zeroPct,
      impact: new Fraction(245025n, 445500n),
    },
    {
      input: 100n,
      reserves: [100n, 100n],
      fee: zeroPct,
      impact: new Fraction(400400n, 20020000n),
    },
    {
      input: 50n,
      reserves: [100n, 100n],
      fee: zeroPct,
      impact: new Fraction(200200n, 10010000n),
    },

    // Simple boundary cases
    {
      input: 10n,
      reserves: [10n, 30n],
      fee: threePct,
      impact: new Fraction(20315n, 200450n),
    },
    {
      input: 100n,
      reserves: [1n, 100n],
      fee: threePct,
      impact: new Fraction(251100n, 445500n),
    },
    {
      input: 100n,
      reserves: [100n, 100n],
      fee: threePct,
      impact: new Fraction(1001000n, 20020000n),
    },
    {
      input: 50n,
      reserves: [100n, 100n],
      fee: threePct,
      impact: new Fraction(600600n, 10010000n),
    },

    // // Real world examples
    {
      input: 5n,
      reserves: [84159832107n, 123172010729n],
      fee: fivePct,
      impact: new Fraction(168806906319235n, 842673001141955n),
    },
    {
      input: 100n,
      reserves: [84159832107n, 123172010729n],
      fee: fivePct,
      impact: new Fraction(849140270799500n, 16853460022839100n),
    },
    {
      input: 1291591603n,
      reserves: [5753371381n, 672426600000n],
      fee: onePct,
      impact: new Fraction(15118057654414078594677n, 40350603201831427592080n),
    },
  ] as {
    input: bigint;
    reserves: TPair;
    fee: TFractionLike;
    impact: Fraction;
  }[])(
    "gets the correct swap input, given different swap outputs (%#)",
    ({ input, reserves, fee, impact }) => {
      const outcome = getSwapOutput(
        usdc,
        input,
        ...reserves,
        fee,
        Fraction.ZERO,
        1000n,
      );
      const actual = getSwapInput(
        usdc,
        outcome.output,
        ...reserves,
        fee,
        Fraction.ZERO,
        1000n,
      );
      const outcomeForActual = getSwapOutput(
        usdc,
        actual.input,
        ...reserves,
        fee,
        Fraction.ZERO,
        1000n,
      );
      expect(outcome.output).toBe(outcomeForActual.output);
      expect(actual.lpFee.amount).toBe(outcomeForActual.lpFee.amount);
      expect(actual.nextInputReserve).toBe(outcomeForActual.nextInputReserve);
      expect(actual.nextOutputReserve).toBe(outcomeForActual.nextOutputReserve);
      expect(actual.priceImpact).toEqual(outcomeForActual.priceImpact);
      expect(actual.priceImpact).toStrictEqual(impact);
    },
  );
});
