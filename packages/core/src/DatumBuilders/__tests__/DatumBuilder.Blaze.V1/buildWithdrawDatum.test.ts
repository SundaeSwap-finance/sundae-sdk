import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { IWithdrawArguments } from "../../../@types/datumbuilder.js";
import { DatumBuilderV1 } from "../../DatumBuilder.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderV1;
const expectations = V1_EXPECTATIONS.buildWithdrawDatum;

beforeEach(() => {
  builderInstance = new DatumBuilderV1("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildWithdrawDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildWithdrawDatum(
      expectations[0].args as IWithdrawArguments,
    );

    expect(result.inline).toEqual(expectations[0].expectations.inline);
    expect(result.hash).toEqual(expectations[0].expectations.hash);
  });
});
