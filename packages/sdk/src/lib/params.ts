import { IParams, TSupportedNetworks } from "../types";

export const params: Record<TSupportedNetworks, IParams> = {
  Mainnet: {
    ESCROW_ADDRESS:
      "addr_test1wr4qjrd3we4fmhjt37m0wpnenu8gc78favuarf04ngq4kuchzdkrf",
    SCOOPER_FEE: 2000000n,
  },
  Preview: {
    ESCROW_ADDRESS:
      "addr_test1wr4qjrd3we4fmhjt37m0wpnenu8gc78favuarf04ngq4kuchzdkrf",
    SCOOPER_FEE: 2000000n,
  },
};
