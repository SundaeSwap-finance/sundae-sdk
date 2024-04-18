import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";

import { EDatumType } from "../../../@types/datumbuilder.js";
import { PREVIEW_DATA } from "../../../exports/testing.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildWithdrawDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildWithdrawDatum({
      destinationAddress: {
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
      ident: PREVIEW_DATA.pools.v3.ident,
      order: {
        lpToken: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
      },
      scooperFee: 1_000_000n,
    });

    expect(result.inline).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87c9f9f40401864ffff43d87980ff"
    );
    expect(result.hash).toEqual(
      "609aac31eaf01971460fbddad279ac8312c6f777295655ce4699b3494cefb00a"
    );
  });
});
