import { jest } from "@jest/globals";

import { DatumBuilderLucidV1 } from "../../DatumBuilder.Lucid.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderLucidV1;
const expectations = V1_EXPECTATIONS.buildPoolIdent;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildPoolIdent", () => {
  it("should correctly build and validate a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(expectations[0].args)
    ).toThrowError(expectations[0].expectations.error);

    const validIdent = builderInstance.buildPoolIdent(expectations[1].args);
    expect(validIdent).toEqual(expectations[1].expectations.value);
  });
});
