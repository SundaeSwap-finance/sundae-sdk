import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { IPoolData, OrderAddresses } from "../@types";

interface NetworkData {
  pool: IPoolData;
  address: string;
  assets: {
    tada: AssetAmount<IAssetAmountMetadata>;
    tindy: AssetAmount<IAssetAmountMetadata>;
  };
  orderAddresses: OrderAddresses;
}

const PREVIEW_DATA: NetworkData = {
  address:
    "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32",
  pool: {
    ident: "06",
    fee: "1",
    assetA: {
      assetId: "",
      decimals: 6,
    },
    assetB: {
      assetId:
        "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
      decimals: 0,
    },
    quantityA: "500000000",
    quantityB: "250000000",
  },
  assets: {
    tada: new AssetAmount(20000000n, { assetId: "", decimals: 6 }),
    tindy: new AssetAmount(20000000n, {
      assetId:
        "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
      decimals: 0,
    }),
  },
  orderAddresses: {
    DestinationAddress: {
      address:
        "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
    },
    AlternateAddress:
      "addr_test1qqpxt8wyqmsa28pxjk7z893txpy8608tn9d7kyaknpgfcmcjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqllv3yr",
  },
};

export { PREVIEW_DATA };
