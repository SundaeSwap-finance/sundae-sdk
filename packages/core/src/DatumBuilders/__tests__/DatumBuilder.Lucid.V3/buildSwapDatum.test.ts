import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";

import { EDatumType } from "../../../@types/datumbuilder.js";
import { ADA_METADATA } from "../../../constants.js";
import { PREVIEW_DATA } from "../../../exports/testing.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildSwapDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildSwapDatum({
      destinationAddress: {
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
      ident: PREVIEW_DATA.pools.v3.ident,
      order: {
        offered: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
        minReceived: new AssetAmount(100n, {
          ...ADA_METADATA,
          assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
        }),
      },
      scooperFee: 1_000_000n,
    });

    expect(result.hash).toEqual(
      "28322af9b782e891292b98d14c7b6ed32d082a596d8ca36caf77aafea3d6873e"
    );
    expect(result.inline).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffff43d87980ff"
    );
  });

  it("should correctly build the datum, variation 2", () => {
    const result = builderInstance.buildSwapDatum({
      destinationAddress: {
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.HASH,
          value:
            "801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7da",
        },
      },
      ident: PREVIEW_DATA.pools.v3.ident,
      order: {
        offered: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
        minReceived: new AssetAmount(100n, {
          ...ADA_METADATA,
          assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
        }),
      },
      scooperFee: 1_000_000n,
    });

    expect(result.hash).toEqual(
      "3a2de0d39117275f8bad700b485310feaa47af731719547a5e29f5e84e142ed0"
    );
    expect(result.inline).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a9f5820801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7daffffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffff43d87980ff"
    );
  });
});
