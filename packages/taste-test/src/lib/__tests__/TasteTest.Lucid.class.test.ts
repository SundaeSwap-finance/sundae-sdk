import { setupLucid } from "@sundaeswap/core/lucid";
import { Lucid } from "lucid-cardano";

import { TasteTestLucid } from "../classes/TasteTest.Lucid.class.js";

let TT: TasteTestLucid;

const { getUtxosByOutRefMock } = setupLucid((lucid) => {
  TT = new TasteTestLucid(lucid);
});

describe("TasteTestLucid", () => {
  it("should initialize with the right config", () => {
    expect(TT.lucid).toBeInstanceOf(Lucid);
  });
});
