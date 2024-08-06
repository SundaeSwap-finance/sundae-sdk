import { AssetAmount } from "@sundaeswap/asset";
import { ADA_METADATA, SundaeUtils } from "@sundaeswap/core/utilities";
import { useEffect } from "react";

import { ADA_TX_FEE, SCOOPER_FEE } from "../../../constants.js";
import { useBalance } from "../../../hooks/useBalance.js";
import { IAssetMetadata } from "../../../types/assets.js";
import { OrderActions } from "../actions.js";
import { useOrderContext } from "../context.js";

export const useAdaAfterSwap = () => {
  const {
    state: {
      derived,
      assets: { given, taken },
    },
    dispatch,
  } = useOrderContext();
  const { balance } = useBalance();

  /**
   * Updates the estimated ADA left after a swap, **NOT** including
   * the minimum ADA threshold. This is so we can compare the leftover
   * ADA against the minimum constraint if needed.
   */
  useEffect(() => {
    if (!balance || (!given && !taken)) {
      return;
    }

    const baseAda = new AssetAmount<IAssetMetadata>(
      balance?.amount ?? 0n,
      ADA_METADATA
    );
    let addedAda = new AssetAmount<IAssetMetadata>(0, ADA_METADATA);
    let subtractedAda = new AssetAmount<IAssetMetadata>(0, ADA_METADATA);

    if (given && SundaeUtils.isAdaAsset(given.metadata)) {
      subtractedAda = subtractedAda.add(given);
    }

    if (taken && SundaeUtils.isAdaAsset(taken.metadata)) {
      addedAda = addedAda.add(taken);
    }

    if (derived?.transaction?.builtTx?.fees) {
      subtractedAda = subtractedAda.add(
        derived.transaction.builtTx.fees.scooperFee
      );
      if (derived?.transaction?.builtTx?.fees?.cardanoTxFee) {
        subtractedAda.add(derived.transaction.builtTx.fees.cardanoTxFee);
      }
    } else {
      subtractedAda = subtractedAda.add(SCOOPER_FEE).add(ADA_TX_FEE);
    }

    OrderActions.setAdaAfterSwap(
      baseAda.add(addedAda).subtract(subtractedAda),
      dispatch,
      "OrderContext.useAdaAfterSwap"
    );
  }, [balance, taken, given, derived?.transaction?.builtTx?.fees]);
};
