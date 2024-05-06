import { jest } from "@jest/globals";

import { LucidHelper } from "../../../Utilities/LucidHelper.class.js";
import { PREVIEW_DATA } from "../../../exports/testing.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";
import { TSignatureSchema } from "../../contracts/contracts.v3.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildOwnerDatum()", () => {
  it("should build the owner datum properly", () => {
    const spiedLucidHelperThrow = jest.spyOn(
      LucidHelper,
      "throwInvalidOrderAddressesError"
    );
    const spiedLucidHelperAddressHashes = jest.spyOn(
      LucidHelper,
      "getAddressHashes"
    );

    const result = builderInstance.buildOwnerDatum(
      PREVIEW_DATA.addresses.current
    );

    expect(spiedLucidHelperAddressHashes).toHaveBeenCalledWith(
      PREVIEW_DATA.addresses.current
    );
    expect(spiedLucidHelperThrow).not.toHaveBeenCalled();
    expect(result.inline).toEqual(
      "d8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff"
    );
    expect(result.hash).toEqual(
      "eacbeb744f70afc638bd8e610fc8c91d5761da59ace673aeb3cb23a3f9fb5eab"
    );
    expect(result.schema).toMatchObject<TSignatureSchema>({
      Address: {
        hex: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
      },
    });
  });
});
