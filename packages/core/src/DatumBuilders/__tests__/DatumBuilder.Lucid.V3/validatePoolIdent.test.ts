import { jest } from "@jest/globals";

import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildPoolIdent", () => {
  it("should correctly build and validate a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(V3_EXPECTATIONS.validatePoolIdent[0].args)
    ).toThrowError(V3_EXPECTATIONS.validatePoolIdent[0].expectations.error);

    const validIdent = builderInstance.buildPoolIdent(
      V3_EXPECTATIONS.validatePoolIdent[1].args
    );

    expect(validIdent).toEqual(
      V3_EXPECTATIONS.validatePoolIdent[1].expectations.result
    );
  });
});
