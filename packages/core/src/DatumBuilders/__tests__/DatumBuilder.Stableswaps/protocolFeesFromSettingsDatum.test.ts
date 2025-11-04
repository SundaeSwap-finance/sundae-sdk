import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { STABLESWAP_EXPECTATIONS } from "../../__data__/stableswaps.expectations.js";
import {
  DatumBuilderStableswaps,
  IDatumBuilderMintStablePoolArgs,
} from "../../DatumBuilder.Stableswaps.class.js";
import { DatumBuilderV3 } from "../../DatumBuilder.V3.class.js";

let builderInstance: DatumBuilderStableswaps;

beforeEach(() => {
  builderInstance = new DatumBuilderStableswaps("preview");
});

afterEach(() => {
  mock.restore();
});

describe("protocolFeesFromSettingsDatum()", () => {
  it("should extract the protocol fees from the settings datum properly", () => {
    const protocolFees = builderInstance.protocolFeesFromSettingsDatum(
      STABLESWAP_EXPECTATIONS.protocolFeesFromSettingsDatum[0].settingsDatum,
    );

    expect(protocolFees).toEqual(
      STABLESWAP_EXPECTATIONS.protocolFeesFromSettingsDatum[0].expectations
        .protocolFees,
    );
  });
});
