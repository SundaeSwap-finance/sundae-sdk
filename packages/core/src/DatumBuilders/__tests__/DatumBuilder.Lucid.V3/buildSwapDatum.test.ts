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
      "4a3aa150e3171268e291a237190d6d770b4e93521694fea3aaeecb8c8b50c284"
    );
    expect(result.inline).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffffd87980ff"
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
      "ac6343b5d828f6ed3d8ef02f9ca1da8498c4de93f76aeae934de52d53d99cc7f"
    );
    expect(result.inline).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a9f5820801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7daffffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffffd87980ff"
    );
  });
});
