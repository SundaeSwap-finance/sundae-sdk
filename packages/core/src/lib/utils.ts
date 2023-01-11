import { TSwapAsset } from "../classes/SwapConfig.class";

export const sortSwapAssets = (assets: [IPoolDataAsset, IPoolDataAsset]) => {
  return assets.sort((a, b) => a.assetId.localeCompare(b.assetId));
};

export const getAssetSwapDirection = (
  { assetID }: TSwapAsset,
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
