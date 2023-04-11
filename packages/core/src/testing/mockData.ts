import { IAsset, IPoolData, OrderAddresses } from "../@types";
import { AssetAmount } from "../classes/AssetAmount.class";

interface NetworkData {
  pool: IPoolData;
  address: string;
  assets: {
    tada: IAsset & Record<string, unknown>;
    tindy: IAsset & Record<string, unknown>;
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
    tada: {
      amount: new AssetAmount(20000000n, 6),
      assetId: "",
      poolId: "",
    },
    tindy: {
      amount: new AssetAmount(20000000n, 0),
      assetId:
        "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
      poolId: "",
    },
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
