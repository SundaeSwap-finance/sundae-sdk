import { TSupportedNetworks } from "../@types";

export const providerBaseUrls: Record<TSupportedNetworks, string> = {
  mainnet: "https://stats.sundaeswap.finance/graphql",
  preview: "https://api.stats.preview.sundaeswap.finance/graphql",
};
