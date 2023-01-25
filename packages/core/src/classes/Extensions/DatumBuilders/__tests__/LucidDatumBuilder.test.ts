"use strict";

import {
  TEST_buildDepositDatum,
  TEST_buildSwapDatum,
  TEST_buildWithdrawDatum,
} from "../../../../testing/DatumBuilder";
import { DatumBuilderLucid } from "../DatumBuilder.Lucid.class";

let datumBuilder: DatumBuilderLucid;

beforeEach(() => {
  datumBuilder = new DatumBuilderLucid("preview");
});

describe("DatumBuilderLucid", () => {
  it("should properly construct a CBOR string when running buildSwapDatum", () => {
    TEST_buildSwapDatum(datumBuilder);
  });

  it("should properly construct a CBOR string when running buildDepositDatum", () => {
    TEST_buildDepositDatum(datumBuilder);
  });

  it("should properly construct a CBOR string when running buildWithdrawDatum", () => {
    TEST_buildWithdrawDatum(datumBuilder);
  });
});
