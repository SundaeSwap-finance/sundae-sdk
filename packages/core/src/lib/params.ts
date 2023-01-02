import { IParams, TSupportedNetworks } from "../types";

export const params: Record<TSupportedNetworks, IParams> = {
  Mainnet: {
    ESCROW_ADDRESS: "",
    SCOOPER_FEE: 2500000n,
    RIDER_FEE: 2000000n,
  },
  Preview: {
    ESCROW_ADDRESS:
      "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
    SCOOPER_FEE: 2500000n,
    RIDER_FEE: 2000000n,
  },
};
