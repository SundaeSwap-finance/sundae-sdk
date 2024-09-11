import { AssetAmount } from "@sundaeswap/asset";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import {
  EDatumType,
  EPoolCoin,
  ISwapArguments,
} from "../../../@types/datumbuilder.js";
import { PREVIEW_DATA } from "../../../exports/testing.js";
import { DatumBuilderBlazeV1 } from "../../DatumBuilder.Blaze.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderBlazeV1;
const expectations = V1_EXPECTATIONS.buildSwapDatum;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV1("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildSwapDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildSwapDatum(
      expectations[0].args as ISwapArguments,
    );

    expect(result.inline).toEqual(expectations[0].expectations.inline);
    expect(result.hash).toEqual(expectations[0].expectations.hash);
  });

  it("should correctly build the datum, variation 2", () => {
    const result = builderInstance.buildSwapDatum({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.HASH,
            value:
              "801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7da",
          },
        },
      },
      ident: PREVIEW_DATA.pools.v1.ident,
      fundedAsset: new AssetAmount(100n, PREVIEW_DATA.assets.tindy.metadata),
      swap: {
        SuppliedCoin: EPoolCoin.B,
        MinimumReceivable: new AssetAmount(
          10_000_000n,
          PREVIEW_DATA.assets.tada.metadata,
        ),
      },
      scooperFee: 1_000_000n,
    });

    expect(result.inline).toEqual(
      "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd8799f5820801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7daffffd87a80ff1a000f4240d8799fd87a801864d8799f1a00989680ffffff",
    );
    expect(result.hash).toEqual(
      "ffd5dd8d7952afc1f6e890b7a5d648d3d74df05abc1997da1acaf94dc01f8a73",
    );
  });
});
