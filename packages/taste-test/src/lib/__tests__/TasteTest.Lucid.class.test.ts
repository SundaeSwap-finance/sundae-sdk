import { setupLucid } from "@sundaeswap/core/testing";
import { Lucid } from "lucid-cardano";

import { TasteTestLucid } from "../classes/TasteTest.Lucid.class.js";

let TT: TasteTestLucid;

setupLucid(async (lucid) => {
  TT = new TasteTestLucid(lucid);
});

describe("TasteTestLucid", () => {
  it("should initialize with the right config", () => {
    expect(TT.lucid).toBeInstanceOf(Lucid);
  });
});
