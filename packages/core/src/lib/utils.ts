import { AssetAmount } from "src/classes/AssetAmount.class";
import {
  IPoolDataAsset,
  IProtocolParams,
  TSupportedNetworks,
  IAsset,
  IPoolData,
} from "../@types";

export const sortSwapAssets = (assets: [IPoolDataAsset, IPoolDataAsset]) => {
  return assets.sort((a, b) => a.assetId.localeCompare(b.assetId));
};

export const getAssetSwapDirection = (
  { assetID }: IAsset,
  assets: [IPoolDataAsset, IPoolDataAsset]
): 0 | 1 => {
  const sorted = sortSwapAssets(assets);
  if (Object.values(sorted[1]).includes(assetID)) {
    return 1;
  }

  return 0;
};

export const getParams = (network: TSupportedNetworks): IProtocolParams => {
  const params: Record<TSupportedNetworks, IProtocolParams> = {
    mainnet: {
      ESCROW_ADDRESS: "",
      SCOOPER_FEE: 2500000n,
      RIDER_FEE: 2000000n,
    },
    preview: {
      ESCROW_ADDRESS:
        "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
      SCOOPER_FEE: 2500000n,
      RIDER_FEE: 2000000n,
    },
  };

  return params[network];
};

export const getMinReceivableFromSlippage = (
  pool: IPoolData,
  suppliedAsset: IAsset,
  slippage: number
) => {
  const base = suppliedAsset.amount.getNumber() * (1 - Number(pool.fee));
  const ratio = Number(pool.quantityA) / Number(pool.quantityB);
  const amount = BigInt(Math.floor(base * ratio * (1 - slippage)));
  let decimals: number;

  if (suppliedAsset.assetID === pool.assetA.assetId) {
    decimals = pool.assetB.decimals;
  } else {
    decimals = pool.assetA.decimals;
  }

  return new AssetAmount(amount, decimals);
};
