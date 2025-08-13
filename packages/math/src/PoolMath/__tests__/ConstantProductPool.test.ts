import { test, describe, it, expect } from "bun:test";
import { Fraction, TFractionLike } from "@sundaeswap/fraction";
import { AssetAmount } from "@sundaeswap/asset";
import {
  getSwapOutput,
  getSwapInput,
  TPair,
  TRatioDirection,
  IRatioCalculationAsset,
  IRatioCalculationResult,
  getSwapRatio,
} from "../ConstantProductPool.js";
import { getFirstLp } from "../ConstantProductPool.js";
import { calculateLiquidity } from "../ConstantProductPool.js";

describe("getSwapOutput", () => {
  const zeroThreePct = new Fraction(3, 1000);
  const onePct = new Fraction(1, 100);
  const zeroPct = Fraction.ZERO;

  test("throws if any of the arguments are negative", () => {
    expect(() => getSwapOutput(-1n, 10n, 10n, Fraction.ZERO)).toThrow();
    expect(() => getSwapOutput(1n, -10n, 10n, Fraction.ZERO)).toThrow();
    expect(() => getSwapOutput(1n, 10n, -10n, Fraction.ZERO)).toThrow();
    expect(() =>
      getSwapOutput(1n, 1n, 1n, Fraction.asFraction(-0.1)),
    ).toThrow();
  });

  test("throws if fee is greater than or equal 1", () => {
    expect(() =>
      getSwapOutput(1n, 10n, 10n, Fraction.asFraction(1)),
    ).not.toThrow();
    expect(() =>
      getSwapOutput(1n, 10n, 10n, Fraction.asFraction(1.132)),
    ).toThrow();
  });

  test("rounds up for non-fractional assets", () => {
    expect(getSwapOutput(83n, 10000n, 500n, zeroThreePct).output).toEqual(4n);
    expect(getSwapOutput(83n, 10000n, 500n, zeroThreePct, true).output).toEqual(
      5n,
    );
  });

  test.each([
    // Ideal, 0% pool
    {
      id: 1,
      input: 1n,
      inReserve: [1n, 1n],
      fee: zeroPct,
      out: 0n,
      outReserve: [2n, 1n],
      lpFee: 0n,
      impact: new Fraction(0n, 0n),
    },
    {
      id: 2,
      input: 1n,
      inReserve: [1n, 2n],
      fee: zeroPct,
      out: 1n,
      outReserve: [2n, 1n],
      lpFee: 0n,
      impact: new Fraction(1n, 2n),
    },
    {
      id: 3,
      input: 100n,
      inReserve: [1n, 2n],
      fee: zeroPct,
      out: 1n,
      outReserve: [101n, 1n],
      lpFee: 0n,
      impact: Fraction.asFraction("0.995"),
    },
    {
      id: 4,
      input: 100n,
      inReserve: [1n, 100n],
      fee: zeroPct,
      out: 99n,
      outReserve: [101n, 1n],
      lpFee: 0n,
      impact: Fraction.asFraction("0.9901"),
    },
    {
      id: 5,
      input: 100n,
      inReserve: [100n, 100n],
      fee: zeroPct,
      out: 50n,
      outReserve: [200n, 50n],
      lpFee: 0n,
      impact: new Fraction(5000n, 10000n),
    },
    {
      id: 6,
      input: 50n,
      inReserve: [100n, 100n],
      fee: zeroPct,
      out: 33n,
      outReserve: [150n, 67n],
      lpFee: 0n,
      impact: new Fraction(1700n, 5000n),
    },

    // Simple boundary cases
    {
      id: 7,
      input: 1n,
      inReserve: [1n, 1n],
      fee: zeroThreePct,
      out: 0n,
      outReserve: [2n, 1n],
      lpFee: 0n,
      impact: new Fraction(0n, 0n),
    },
    {
      id: 8,
      input: 1n,
      inReserve: [1n, 2n],
      fee: zeroThreePct,
      out: 0n,
      outReserve: [2n, 2n],
      lpFee: 0n,
      impact: Fraction.asFraction("0.5"),
    },
    {
      id: 9,
      input: 1n,
      inReserve: [1n, 3n],
      fee: zeroThreePct,
      out: 1n,
      outReserve: [2n, 2n],
      lpFee: 0n,
      impact: new Fraction(2, 3),
    },
    {
      id: 10,
      input: 100n,
      inReserve: [1n, 2n],
      fee: zeroThreePct,
      out: 1n,
      outReserve: [101n, 1n],
      lpFee: 0n,
      impact: Fraction.asFraction("0.995"),
    },
    {
      id: 11,
      input: 100n,
      inReserve: [1n, 100n],
      fee: zeroThreePct,
      out: 99n,
      outReserve: [101n, 1n],
      lpFee: 0n,
      impact: Fraction.asFraction("0.9901"),
    },
    {
      id: 12,
      input: 100n,
      inReserve: [100n, 100n],
      fee: zeroThreePct,
      out: 49n,
      outReserve: [200n, 51n],
      lpFee: 0n,
      impact: new Fraction(5100n, 10000n),
    },
    {
      id: 13,
      input: 50n,
      inReserve: [100n, 100n],
      fee: zeroThreePct,
      out: 33n,
      outReserve: [150n, 67n],
      lpFee: 0n,
      impact: new Fraction(1700n, 5000n),
    },

    // Real world examples
    {
      id: 14,
      input: 1291591603n,
      inReserve: [5753371381n, 672426600000n],
      fee: onePct,
      out: 122271016729n,
      outReserve: [7044962984n, 550155583271n],
      lpFee: 12915916n,
      impact: new Fraction(156344976337673367251n, 859815544712074200000n),
    },
    {
      id: 15,
      input: 1000000n,
      inReserve: [3696260028076n, 77871393827281n],
      fee: zeroThreePct,
      out: 21004409n,
      outReserve: [3696261028076n, 77871372822872n],
      lpFee: 3000n,
      impact: new Fraction(22245739369916n, 77637779645799157000n),
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
      const actual = getSwapOutput(input, ...inReserve, fee);
      expect(actual.output).toBe(out);
      expect(actual.inputLpFee).toBe(lpFee);
      expect(actual.nextInputReserve).toBe(outReserve[0]);
      expect(actual.nextInputReserve).toBe(input + inReserve[0]);
      expect(actual.nextOutputReserve).toBe(outReserve[1]);
      expect(actual.nextOutputReserve + actual.output).toBe(inReserve[1]);
      expect(actual.priceImpact).toStrictEqual(impact);
    },
  );
});

describe("getSwapInput", () => {
  const fivePct = new Fraction(5, 100);
  const threePct = new Fraction(3, 100);
  const onePct = new Fraction(1, 100);
  const zeroPct = Fraction.ZERO;

  test("throws if any of the arguments are negative", () => {
    expect(() => getSwapInput(-1n, 10n, 10n, Fraction.ZERO)).toThrow();
    expect(() => getSwapInput(1n, -10n, 10n, Fraction.ZERO)).toThrow();
    expect(() => getSwapInput(1n, 10n, -10n, Fraction.ZERO)).toThrow();
    expect(() =>
      getSwapInput(1n, 10n, 10n, Fraction.asFraction(-0.1)),
    ).toThrow();
  });

  test("throws if fee is greater than or equal 1", () => {
    expect(() => getSwapInput(1n, 10n, 10n, Fraction.asFraction(1))).toThrow();
    expect(() =>
      getSwapInput(1n, 10n, 10n, Fraction.asFraction(1.132)),
    ).toThrow();
  });

  test("throws if output is greater than or equal to output reserve", () => {
    expect(() =>
      getSwapInput(10n, 10n, 10n, Fraction.asFraction(0.1)),
    ).toThrow();
    expect(() => getSwapInput(1n, 1n, 1n, Fraction.asFraction(0.1))).toThrow();
    expect(() => getSwapInput(10n, 1n, 1n, Fraction.asFraction(0.1))).toThrow();
  });

  test.each([
    // Ideal 0% fee pool
    {
      input: 1n,
      reserves: [1n, 2n],
      fee: zeroPct,
      impact: new Fraction(3n, 4n),
    },
    {
      input: 100n,
      reserves: [1n, 2n],
      fee: zeroPct,
      impact: new Fraction(3n, 4n),
    },
    {
      input: 100n,
      reserves: [1n, 100n],
      fee: zeroPct,
      impact: new Fraction(9901n, 10000n),
    },
    {
      input: 100n,
      reserves: [100n, 100n],
      fee: zeroPct,
      impact: new Fraction(5100n, 10100n),
    },
    {
      input: 50n,
      reserves: [100n, 100n],
      fee: zeroPct,
      impact: new Fraction(1700n, 5000n),
    },

    // Simple boundary cases
    {
      input: 1n,
      reserves: [1n, 3n],
      fee: threePct,
      impact: new Fraction(2n, 3n),
    },
    {
      input: 100n,
      reserves: [1n, 2n],
      fee: threePct,
      impact: new Fraction(3n, 4n),
    },
    {
      input: 100n,
      reserves: [1n, 100n],
      fee: threePct,
      impact: new Fraction(4902n, 5000n),
    },
    {
      input: 100n,
      reserves: [100n, 100n],
      fee: threePct,
      impact: new Fraction(4800n, 9700n),
    },
    {
      input: 50n,
      reserves: [100n, 100n],
      fee: threePct,
      impact: new Fraction(1600n, 4800n),
    },

    // Real world examples
    {
      input: 5n,
      reserves: [84159832107n, 123172010729n],
      fee: fivePct,
      impact: new Fraction(110901061003n, 615860053645n),
    },
    {
      input: 100n,
      reserves: [84159832107n, 123172010729n],
      fee: fivePct,
      impact: new Fraction(3124356382n, 11701341019255n),
    },
    {
      input: 1291591603n,
      reserves: [5753371381n, 672426600000n],
      fee: onePct,
      impact: new Fraction(156344976337673367251n, 859815544712074200000n),
    },
  ] as {
    input: bigint;
    reserves: TPair;
    fee: TFractionLike;
    impact: Fraction;
  }[])(
    "gets the correct swap input, given different swap outputs (%#)",
    ({ input, reserves, fee, impact }) => {
      const outcome = getSwapOutput(input, ...reserves, fee);
      const actual = getSwapInput(outcome.output, ...reserves, fee);
      const outcomeForActual = getSwapOutput(actual.input, ...reserves, fee);
      expect(outcome.output).toBe(outcomeForActual.output);
      expect(actual.inputLpFee).toBe(outcomeForActual.inputLpFee);
      expect(actual.nextInputReserve).toBe(outcomeForActual.nextInputReserve);
      expect(actual.nextOutputReserve).toBe(outcomeForActual.nextOutputReserve);
      expect(actual.priceImpact).toEqual(outcomeForActual.priceImpact);
      expect(actual.priceImpact).toStrictEqual(impact);
    },
  );
});

describe("calculateLiquidity", () => {
  test.each([
    {
      a: 1n,
      b: 2n,
      reserves: [1n, 2n],
      totalLp: getFirstLp(1n, 2n),
      generatedLp: 1n,
      nextTotalLp: 2n,
      shareAfterDeposit: new Fraction(1n, 2n),
      aChange: 0n,
      bChange: 0n,
    },
    {
      a: 1n,
      b: 100n,
      reserves: [1n, 100n],
      totalLp: getFirstLp(1n, 100n),
      generatedLp: 10n,
      nextTotalLp: 20n,
      shareAfterDeposit: new Fraction(10n, 20n),
      aChange: 0n,
      bChange: 0n,
    },
    {
      a: 2n,
      b: 200n,
      reserves: [1n, 100n],
      totalLp: getFirstLp(1n, 100n),
      generatedLp: 20n,
      nextTotalLp: 30n,
      shareAfterDeposit: new Fraction(20n, 30n),
      aChange: 0n,
      bChange: 0n,
    },
    // Too much of token a
    {
      a: 5n,
      b: 250n,
      reserves: [1n, 100n],
      totalLp: getFirstLp(1n, 100n),
      generatedLp: 20n,
      nextTotalLp: 30n,
      shareAfterDeposit: new Fraction(20n, 30n),
      aChange: 3n,
      bChange: 0n,
    },

    // Too much of token b
    {
      a: 3n,
      b: 200n,
      reserves: [1n, 100n],
      totalLp: getFirstLp(1n, 100n),
      generatedLp: 20n,
      nextTotalLp: 30n,
      shareAfterDeposit: new Fraction(20n, 30n),
      aChange: 1n,
      bChange: 0n,
    },

    // Real world examples
    {
      a: 100947000n,
      b: 151611403n,
      reserves: [9993743829n, 15009515148n],
      totalLp: 12247448713n,
      generatedLp: 123711715n,
      nextTotalLp: 12371160428n,
      shareAfterDeposit: new Fraction(123711715n, 12371160428n),
      aChange: 1n,
      bChange: 0n,
    },
    {
      a: 1291591603n,
      b: 150955064896n,
      reserves: [5753371381n, 672426600000n],
      totalLp: getFirstLp(5753371381n, 672426600000n),
      generatedLp: 13963247972n,
      nextTotalLp: 76162282982n,
      shareAfterDeposit: new Fraction(13963247972n, 76162282982n),
      aChange: 1n,
      bChange: 0n,
    },
    {
      a: 5000000n,
      b: 1869359n,
      reserves: [684236468144n, 256584648756n],
      totalLp: getFirstLp(684236468144n, 256584648756n),
      generatedLp: 3052674n,
      nextTotalLp: 419007317383n,
      shareAfterDeposit: new Fraction(3052674n, 419007317383n),
      aChange: 14965n,
      bChange: 0n,
    },
  ] as {
    a: bigint;
    b: bigint;
    reserves: TPair;
    totalLp: bigint;
    nextTotalLp: bigint;
    generatedLp: bigint;
    requiredB: bigint;
    shareAfterDeposit: Fraction;
    aChange: bigint;
    bChange: bigint;
  }[])(
    "gets the right liquidity, given different inputs (%#)",
    ({ a, b, reserves, totalLp, ...expectedResult }) => {
      const actualResult = calculateLiquidity(a, b, ...reserves, totalLp);
      expect(actualResult.generatedLp).toBe(expectedResult.generatedLp);
      expect(actualResult.nextTotalLp).toBe(expectedResult.nextTotalLp);
      expect(actualResult.aChange).toBe(expectedResult.aChange);
      expect(actualResult.bChange).toBe(expectedResult.bChange);
      expect(actualResult.shareAfterDeposit).toStrictEqual(
        expectedResult.shareAfterDeposit,
      );
    },
  );

  it("should throw an error when the requiredB amount is less than 1", () => {
    const zeroError = new Error("Cannot use a deposit asset amount of 0");
    expect(() =>
      calculateLiquidity(2n, 0n, 100n, 1n, getFirstLp(100n, 1n)),
    ).toThrowError(zeroError);
    expect(() =>
      calculateLiquidity(0n, 2n, 100n, 1n, getFirstLp(100n, 1n)),
    ).toThrowError(zeroError);
  });
});

describe("getSwapRatio", () => {
  const testCases: {
    direction: TRatioDirection;
    assets: [IRatioCalculationAsset, IRatioCalculationAsset];
    expectedOutput: IRatioCalculationResult;
  }[] = [
    {
      direction: "A_PER_B",
      assets: [
        { quantity: 100n, decimals: 0, assetId: "ada.lovelace" },
        {
          quantity: 200n,
          decimals: 0,
          assetId:
            "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145",
        },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(0n),
        ratioAsFraction: new Fraction(1n, 2n),
        display: "0",
        isDivisible: false,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "A_PER_B",
      assets: [
        {
          quantity: 200n,
          decimals: 0,
          assetId:
            "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145",
        },
        { quantity: 100n, decimals: 0, assetId: "ada.lovelace" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(0n),
        ratioAsFraction: new Fraction(1n, 2n),
        display: "0",
        isDivisible: false,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "B_PER_A",
      assets: [
        {
          quantity: 200n,
          decimals: 0,
          assetId:
            "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145",
        },
        { quantity: 100n, decimals: 0, assetId: "ada.lovelace" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(2n),
        ratioAsFraction: new Fraction(2n, 1n),
        display: "2",
        isDivisible: false,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "A_PER_B",
      assets: [
        { quantity: 100n, decimals: 0, assetId: "A" },
        { quantity: 2000000n, decimals: 6, assetId: "B" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(50n),
        ratioAsFraction: new Fraction(1n, 20000n),
        display: "50",
        isDivisible: false,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "B_PER_A",
      assets: [
        { quantity: 100n, decimals: 0, assetId: "A" },
        { quantity: 2000000n, decimals: 6, assetId: "B" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(20000n, 6),
        ratioAsFraction: new Fraction(20000n, 1n),
        display: "0.02",
        isDivisible: true,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "A_PER_B",
      assets: [
        { quantity: 1000000n, decimals: 6, assetId: "A" },
        { quantity: 200n, decimals: 0, assetId: "B" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(5000n, 6),
        ratioAsFraction: new Fraction(5000n, 1n),
        display: "0.005",
        isDivisible: true,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "B_PER_A",
      assets: [
        { quantity: 1000000n, decimals: 6, assetId: "A" },
        { quantity: 200n, decimals: 0, assetId: "B" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(200n),
        ratioAsFraction: new Fraction(1n, 5000n),
        display: "200",
        isDivisible: false,
        belowMinimumRatio: false,
      },
    },
    {
      direction: "A_PER_B",
      assets: [
        { quantity: 0n, decimals: 6, assetId: "A" },
        { quantity: 1n, decimals: 0, assetId: "B" },
      ],
      expectedOutput: {
        calculatedAmount: new AssetAmount(0n),
        ratioAsFraction: new Fraction(0n, 0n),
        display: "0",
        isDivisible: true,
        belowMinimumRatio: true,
      },
    },
  ];

  test.each(testCases)(
    "given a direction and assets asset pair, returns expected output (%#)",
    ({ direction, expectedOutput, assets }) => {
      const {
        calculatedAmount,
        ratioAsFraction,
        display,
        isDivisible,
        belowMinimumRatio,
      } = getSwapRatio(direction, assets);
      expect(calculatedAmount.amount).toEqual(
        expectedOutput.calculatedAmount.amount,
      );
      expect(calculatedAmount.value.toString()).toEqual(
        expectedOutput.calculatedAmount.value.toString(),
      );
      expect(ratioAsFraction).toEqual(expectedOutput.ratioAsFraction);
      expect(display).toEqual(expectedOutput.display);
      expect(isDivisible).toEqual(expectedOutput.isDivisible);
      expect(belowMinimumRatio).toEqual(expectedOutput.belowMinimumRatio);
    },
  );
});
