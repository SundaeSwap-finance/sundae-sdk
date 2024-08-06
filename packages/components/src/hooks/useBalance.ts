import { AssetAmount } from "@sundaeswap/asset";
import { useEffect, useState } from "react";

import { IAssetMetadata } from "../types/assets.js";
import { useComponentsContext } from "./useComponentsContext.js";

export const useBalance = (assetMetadata?: IAssetMetadata) => {
  const [balance, setBalance] = useState<AssetAmount<IAssetMetadata>>();
  const { sdk } = useComponentsContext();

  useEffect(() => {
    if (!sdk) {
      return;
    }

    const interval = setInterval(async () => {
      const utxos = await sdk.builder().lucid.wallet.getUtxos();
      let balanceAmt = 0n;
      const assetStr = assetMetadata?.assetId.replace(".", "") ?? "lovelace";

      utxos.forEach(({ assets }) => {
        balanceAmt += assets[assetStr];
      });

      setBalance((prev) => {
        if (
          prev &&
          prev.amount === balanceAmt &&
          prev.metadata === assetMetadata
        ) {
          return prev;
        }

        return new AssetAmount(balanceAmt, assetMetadata);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [sdk]);

  return {
    balance,
    loaded: Boolean(balance),
  };
};
