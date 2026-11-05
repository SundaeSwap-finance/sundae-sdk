import { Core } from "@blaze-cardano/sdk";
import { describe, expect, it } from "bun:test";

import { BlazeHelper } from "../BlazeHelper.class.js";

const TOKEN_A = Core.AssetId(`${"aa".repeat(28)}01`);
const TOKEN_B = Core.AssetId(`${"aa".repeat(28)}02`);

describe("BlazeHelper.mergeValues", () => {
  it("sums tokens across every token-bearing value, skipping undefined", () => {
    const merged = BlazeHelper.mergeValues(
      new Core.Value(1n, new Map([[TOKEN_A, 5n]])),
      undefined,
      new Core.Value(2n, new Map([[TOKEN_A, 7n], [TOKEN_B, 3n]])),
      new Core.Value(4n),
    );

    expect(merged.coin()).toEqual(7n);
    expect(merged.multiasset()).toEqual(
      new Map([
        [TOKEN_A, 12n],
        [TOKEN_B, 3n],
      ]),
    );
  });

  it("returns an ADA-only value when no input carries tokens", () => {
    const merged = BlazeHelper.mergeValues(new Core.Value(1n), undefined);
    expect(merged.coin()).toEqual(1n);
    expect(merged.multiasset()).toBeUndefined();
  });
});
