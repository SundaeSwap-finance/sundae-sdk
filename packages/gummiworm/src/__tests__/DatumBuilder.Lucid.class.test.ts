import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderLucid } from "../Classes/DatumBuilder.Lucid.class.js";

let builderInstance: DatumBuilderLucid;

beforeEach(() => {
  builderInstance = new DatumBuilderLucid("preview");
});

afterEach(() => {
  mock.restore();
});

describe("DatumBuilderLucid", () => {
  it("should pass", () => {
    const { inline } = builderInstance.buildDepositDatum({
      address: PREVIEW_DATA.addresses.current,
    });

    const expectedInline =
      "d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ff";

    expect(inline).toEqual(expectedInline);
  });
});
