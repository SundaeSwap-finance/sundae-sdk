import { jest } from "@jest/globals";

import { PREVIEW_DATA } from "../../../TestUtilities/mockData.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";

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
      builderInstance.buildPoolIdent(PREVIEW_DATA.pools.v1.ident)
    ).toThrowError(DatumBuilderLucidV3.INVALID_POOL_IDENT);

    const validIdent = builderInstance.buildPoolIdent(
      PREVIEW_DATA.pools.v3.ident
    );

    expect(validIdent).toEqual(PREVIEW_DATA.pools.v3.ident);
  });
});
