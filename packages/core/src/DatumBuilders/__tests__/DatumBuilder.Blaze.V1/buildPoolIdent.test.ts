import { jest } from "@jest/globals";

import { PREVIEW_DATA } from "../../../TestUtilities/mockData.js";
import { DatumBuilderBlazeV1 } from "../../DatumBuilder.Blaze.V1.class.js";

let builderInstance: DatumBuilderBlazeV1;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildPoolIdent", () => {
  it("should correctly build and validate a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(PREVIEW_DATA.pools.v3.ident)
    ).toThrowError(DatumBuilderBlazeV1.INVALID_POOL_IDENT);

    const validIdent = builderInstance.buildPoolIdent(
      PREVIEW_DATA.pools.v1.ident
    );

    expect(validIdent).toEqual(PREVIEW_DATA.pools.v1.ident);
  });
});
