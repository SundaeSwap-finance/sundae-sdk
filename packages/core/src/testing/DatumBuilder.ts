/**
 * ## DatumBuilder Tests
 *
 * This file exports testing functions to run against your builder.
 * Most tests are automated but ensure that the {@link DatumBuilder}
 * instance you pass in is run against real test data and outputs
 * valid CBOR hex strings to attach to your transactions!
 *
 * For an example, see: /src/classes/DatumBuilders/__tests__/LucidDatumBuilder.test.ts
 *
 * @group Testing
 */

import { DatumBuilder } from "src/classes/DatumBuilder.class";
import { IAsset, PoolCoin, SwapArguments } from "../@types";
import { AssetAmount } from "../classes/AssetAmount.class";

interface TestingParameters {
  DatumBuilder: {
    buildSwapDatum: {
      arguments: [SwapArguments, IAsset];
      results: {
        cbor: string;
      };
    }[];
  };
}

const TESTING_PARAMETERS: TestingParameters = {
  DatumBuilder: {
    buildSwapDatum: [
      {
        arguments: [
          {
            ident: "03",
            orderAddresses: {
              DestinationAddress: {
                address:
                  "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
              },
              AlternateAddress:
                "addr_test1qqpxt8wyqmsa28pxjk7z893txpy8608tn9d7kyaknpgfcmcjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqllv3yr",
            },
            swap: {
              SuppliedCoin: PoolCoin.A,
              MinimumReceivable: new AssetAmount(10000000n, 6),
            },
          },
          {
            amount: new AssetAmount(5000000n, 6),
            assetID: "",
          },
        ],
        results: {
          cbor: "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d8799fd879801a004c4b40d8799f1a00989680ffffff",
        },
      },
      {
        arguments: [
          {
            ident: "03",
            orderAddresses: {
              DestinationAddress: {
                address:
                  "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
              },
              AlternateAddress:
                "addr_test1qqpxt8wyqmsa28pxjk7z893txpy8608tn9d7kyaknpgfcmcjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqllv3yr",
            },
            swap: {
              SuppliedCoin: PoolCoin.B,
            },
          },
          {
            amount: new AssetAmount(5000000n, 6),
            assetID: "",
          },
        ],
        results: {
          cbor: "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d8799fd87a801a004c4b40d87a80ffff",
        },
      },
    ],
  },
};

export const TEST_buildSwapDatum = (builder: DatumBuilder): void => {
  TESTING_PARAMETERS.DatumBuilder.buildSwapDatum.forEach((test) => {
    const result = builder.buildSwapDatum(...test.arguments);
    expect(result.cbor).toEqual(test.results.cbor);
  });
};
