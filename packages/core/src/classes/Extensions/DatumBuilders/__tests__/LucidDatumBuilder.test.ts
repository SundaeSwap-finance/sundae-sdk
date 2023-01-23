"use strict";

import {
  TEST_buildDepositDatum,
  TEST_buildSwapDatum,
} from "../../../../testing/DatumBuilder";
import { LucidDatumBuilder } from "../DatumBuilder.Lucid.class";

let datumBuilder: LucidDatumBuilder;

beforeEach(() => {
  datumBuilder = new LucidDatumBuilder("preview");
});

describe("LucidDatumBuilder", () => {
  it("should properly construct a CBOR string when running buildSwapDatum", () => {
    TEST_buildSwapDatum(datumBuilder);
  });

  it("should properly construct a CBOR string when running buildDepositDatum", () => {
    TEST_buildDepositDatum(datumBuilder);
  });
});
