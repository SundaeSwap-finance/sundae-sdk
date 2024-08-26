import { jest } from "@jest/globals";

import { IWithdrawArguments } from "../../../@types/datumbuilder.js";
import { DatumBuilderLucidV1 } from "../../DatumBuilder.Lucid.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderLucidV1;
const expectations = V1_EXPECTATIONS.buildWithdrawDatum;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildWithdrawDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildWithdrawDatum(
      expectations[0].args as IWithdrawArguments
    );

    expect(result.inline).toEqual(expectations[0].expectations.inline);
    expect(result.hash).toEqual(expectations[0].expectations.hash);
  });
});
