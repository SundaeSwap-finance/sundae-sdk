import { jest } from "@jest/globals";

import { DatumBuilderBlazeV3 } from "../../DatumBuilder.Blaze.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildPoolIdent", () => {
  it("should correctly build and validate a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(V3_EXPECTATIONS.buildPoolIdent[0].args)
    ).toThrowError(V3_EXPECTATIONS.buildPoolIdent[0].expectations.error);

    const validIdent = builderInstance.buildPoolIdent(
      V3_EXPECTATIONS.buildPoolIdent[1].args
    );

    expect(validIdent).toEqual(
      V3_EXPECTATIONS.buildPoolIdent[1].expectations.result
    );
  });
});
