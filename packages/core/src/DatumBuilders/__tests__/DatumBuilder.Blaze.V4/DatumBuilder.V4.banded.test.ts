import { parse } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { describe, expect, it } from "bun:test";
import { BandedConcentratedLiquidityPool } from "@sundaeswap/math";

import { V4Types } from "../../ContractTypes/index.js";
import { DatumBuilderV4 } from "../../DatumBuilder.V4.class.js";

/**
 * The banded module's Create redeemer of preview pool 17eb2dd0… (tx
 * e250fcb9…, 2026-10-06): a 12-band MINT/MNGO ladder whose sqrt-price edges
 * are scaled by the pair's decimals and start above 2^63, launched in band
 * 6. The chain accepted it, so its index is the one the chain pins.
 */
const PREVIEW_CREATE_HEX = "d8799fd8799f9fd8799fd8799f1ba4dc15d6795f50001ba688906bd8b00000ff0100d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba52324a42d8660001ba688906bd8b00000ff0200d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba56a3371e1ad70001ba688906bd8b00000ff0500d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba5b1423f95d480001ba688906bd8b00000ff0b00d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba5f8510d49fb90001ba688906bd8b00000ff1600d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba63f5fdafe22a0001ba688906bd8b00000ff181f00d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba6866ea8b249b0001ba688906bd8b00000ff181f00d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba6cd7d766670c0001ba688906bd8b00000ff1600d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba7148c441a97d0001ba688906bd8b00000ff0b00d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba75b9b11cebee0001ba688906bd8b00000ff0500d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba7a2a9df82e5f0001ba688906bd8b00000ff0200d8799f031903e8ffd8799f031903e8ffffd8799fd8799f1ba7e9b8ad370d00001ba688906bd8b00000ff0100d8799f031903e8ffd8799f031903e8ffffff9f9f1b006c7941856de29600ff9f1b006aeef15c9ad2051b0000c230c1510f17ff9f1b0067187679fc828a1b0002469243f32d44ff9f1b005eae3c86a19dc51b000611860a8878b3ff9f1b004de82bad81b3e51b000e699e59041ea6ff9f1b0036599cd55495421b001f19cef5fb6a8bff9f1b001edf2003f54c641b00369db65ecc3e36ff9f1b000e43ca502efac91b004e219dc79d11e1ff9f1b0005fd2c852879691b005ed1ce64945dc6ff9f1b00023d5b04fe0a891b006729e6b31003b9ff9f1b0000beb28fd787da1b006af4da79a54f28ff9f001b006c793bfc476d55ffffd8799f1ba830c77aeb3410001ba688906bd8b00000ff1890ff0006ff";

describe("DatumBuilderV4 banded concentrated liquidity", () => {
  const builder = new DatumBuilderV4("preview");

  it("reproduces a chain-accepted Create redeemer from its ladder, index included", () => {
    const parsed = parse(
      V4Types.BandedCLCreate,
      Core.PlutusData.fromCbor(Core.HexBlob(PREVIEW_CREATE_HEX)),
    );
    expect(parsed.initial_band).toEqual(6n);
    expect(parsed.pool_output_index).toEqual(0n);
    expect(parsed.initial_state.bands.length).toEqual(12);
    expect(parsed.initial_state.index.length).toEqual(12);

    const ladder: BandedConcentratedLiquidityPool.TLadder = {
      bands: parsed.initial_state.bands.map((b) => ({
        start: { num: b.start.num, den: b.start.den },
        weight: b.weight,
        curve: b.curve === 1n ? 1 : 0,
        feeBuy: { num: b.fee_buy.num, den: b.fee_buy.den },
        feeSell: { num: b.fee_sell.num, den: b.fee_sell.den },
      })),
      closing: {
        num: parsed.initial_state.closing.num,
        den: parsed.initial_state.closing.den,
      },
      weightTotal: parsed.initial_state.weight_total,
    };
    expect(ladder.bands[0]!.start.num).toEqual(11879393928000000000n);

    // The index is derived, never copied: the rebuilt redeemer must be the
    // chain's bytes, so a wrong coefficient would show as a different hash.
    const rebuilt = builder.buildBandedCLCreateRedeemer({
      ladder,
      poolOutputIndex: 0n,
      initialBand: 6n,
    });
    expect(rebuilt.inline).toEqual(PREVIEW_CREATE_HEX);

    // And the config datum alone hashes to what the pool's module_state pins.
    const config = builder.buildBandedCLConfigDatum(ladder);
    expect(config.hash).toEqual(
      DatumBuilderV4.hashModuleConfig(config.inline),
    );
  });

  it("refuses a ladder whose weight total is not the sum of its weights", () => {
    const ladder = BandedConcentratedLiquidityPool.uniformLadder(
      4,
      { num: 1n, den: 2n },
      { num: 2n, den: 1n },
      { num: 3n, den: 1000n },
    );
    expect(() =>
      builder.buildBandedCLConfigDatum({ ...ladder, weightTotal: 5n }),
    ).toThrow(/weightTotal/);
  });
});
