import { Blaze } from "@blaze-cardano/sdk";
import { setupBlaze } from "@sundaeswap/core/testing";
import { describe, expect, it } from "bun:test";

import { TasteTestBuilder } from "../classes/TasteTestBuilder.class.js";

let TT: TasteTestBuilder;

setupBlaze(async (blaze) => {
  TT = new TasteTestBuilder(blaze);
});

describe("TasteTestLucid", () => {
  it("should initialize with the right config", () => {
    expect(TT.blaze).toBeInstanceOf(Blaze);
  });
});
