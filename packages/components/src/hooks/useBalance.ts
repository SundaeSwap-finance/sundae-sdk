import { AssetAmount } from "@sundaeswap/asset";
import { useEffect, useState } from "react";

import { SundaeUtils } from "@sundaeswap/core/utilities";
import { IAssetMetadata } from "../types/assets.js";
import { useComponentsContext } from "./useComponentsContext.js";

export const useBalance = (assetMetadata?: IAssetMetadata) => {
  const [balance, setBalance] = useState<AssetAmount<IAssetMetadata>>();
  const { sdk } = useComponentsContext();

  useEffect(() => {
    if (!sdk) {
      return;
    }

    let syncing = false;

    const syncBalance = async () => {
      if (syncing) {
        return;
      }

      syncing = true;
      const utxos = await sdk.builder().lucid.wallet.getUtxos();
      let balanceAmt = 0n;
      const assetStr = assetMetadata?.assetId.replace(".", "") ?? "";

      utxos.forEach(({ assets }) => {
        balanceAmt +=
          assets[
            SundaeUtils.isAdaAsset({ assetId: assetStr, decimals: 6 })
              ? "lovelace"
              : assetStr
          ];
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
      syncing = false;
    };

    const interval = setInterval(syncBalance, 5000);
    syncBalance();

    return () => clearInterval(interval);
  }, [sdk]);

  return {
    balance,
    loaded: Boolean(balance),
  };
};
