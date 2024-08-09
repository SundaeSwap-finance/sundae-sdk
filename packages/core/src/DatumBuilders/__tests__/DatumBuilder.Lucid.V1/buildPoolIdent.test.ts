import { jest } from "@jest/globals";

import { PREVIEW_DATA } from "../../../TestUtilities/mockData.js";
import { DatumBuilderLucidV1 } from "../../DatumBuilder.Lucid.V1.class.js";

let builderInstance: DatumBuilderLucidV1;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildPoolIdent", () => {
  it("should correctly build and validate a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(PREVIEW_DATA.pools.v3.ident)
    ).toThrowError(DatumBuilderLucidV1.INVALID_POOL_IDENT);

    const validIdent = builderInstance.buildPoolIdent(
      PREVIEW_DATA.pools.v1.ident
    );

    expect(validIdent).toEqual(PREVIEW_DATA.pools.v1.ident);
  });
});
