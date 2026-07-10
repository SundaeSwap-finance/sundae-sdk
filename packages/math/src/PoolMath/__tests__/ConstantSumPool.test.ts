import { describe, expect, it } from "bun:test";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";

import { getSwapOutput } from "../ConstantSumPool.js";

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
