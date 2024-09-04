import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderBlazeV3 } from "../../DatumBuilder.Blaze.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildPoolIdent", () => {
  it("should correctly validate a pool ident", () => {
    expect(() =>
      builderInstance.validatePoolIdent(
        V3_EXPECTATIONS.validatePoolIdent[0].args
      )
    ).toThrowError(V3_EXPECTATIONS.validatePoolIdent[0].expectations.error);

    const validIdent = builderInstance.validatePoolIdent(
      V3_EXPECTATIONS.validatePoolIdent[1].args
    );

    expect(validIdent).toEqual(
      V3_EXPECTATIONS.validatePoolIdent[1].expectations.result as string
    );
  });
});
