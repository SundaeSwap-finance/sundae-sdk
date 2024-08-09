import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";

import { EDatumType } from "../../../@types/datumbuilder.js";
import { ADA_METADATA } from "../../../constants.js";
import { PREVIEW_DATA } from "../../../exports/testing.js";
import { DatumBuilderBlazeV1 } from "../../DatumBuilder.Blaze.V1.class.js";

let builderInstance: DatumBuilderBlazeV1;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildDepositDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildDepositDatum({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      ident: PREVIEW_DATA.pools.v1.ident,
      deposit: {
        CoinAAmount: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
        CoinBAmount: new AssetAmount(100n, {
          ...ADA_METADATA,
          assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
        }),
      },
      scooperFee: 1_000_000n,
    });

    expect(result.inline).toEqual(
      "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a000f4240d87b9fd87a9fd8799f18641864ffffffff"
    );
    expect(result.hash).toEqual(
      "0a6041738e5b943c28c628ae16bcde5e9f0bdda8607a1b12413a80435fc99d7f"
    );
  });
});
