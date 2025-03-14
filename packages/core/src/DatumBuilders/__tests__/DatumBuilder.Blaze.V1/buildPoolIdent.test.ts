import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderV1 } from "../../DatumBuilder.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderV1;
const expectations = V1_EXPECTATIONS.buildPoolIdent;

beforeEach(() => {
  builderInstance = new DatumBuilderV1("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildPoolIdent", () => {
  it("should correctly build and validate a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(expectations[0].args),
    ).toThrowError(expectations[0].expectations.error);

    const validIdent = builderInstance.buildPoolIdent(expectations[1].args);
    expect(validIdent).toEqual(expectations[1].expectations.value as string);
  });
});
