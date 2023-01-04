import { IParams, TSupportedNetworks } from "../types";

export const protocolParams: Record<TSupportedNetworks, IParams> = {
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

export const providerBaseUrls: Record<TSupportedNetworks, string> = {
  mainnet: "https://api.sundaeswap.finance/graphql",
  preview: "https://api.stats.preview.sundaeswap.finance/graphql",
};
