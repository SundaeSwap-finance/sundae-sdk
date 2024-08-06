import { AssetAmount } from "@sundaeswap/asset";
import { ADA_METADATA, SundaeUtils } from "@sundaeswap/core/utilities";
import { useEffect } from "react";

import { MIN_ADA_WALLET_BALANCE } from "../../../constants.js";
import { OrderActions } from "../actions.js";
import { useOrderContext } from "../context.js";
import { useGivenBalance } from "./useGivenBalance.js";

/**
 * Update derived state with data that is
 * dependant on balance information.
 */
export const useGivenExceedsBalance = () => {
  const { state, dispatch } = useOrderContext();
  const { balance, loaded } = useGivenBalance();

  useEffect(() => {
    if (!loaded || !state.assets?.given?.metadata) {
      return;
    }

    if (!balance || balance?.amount === 0n) {
      OrderActions.setGivenExceedsBalance(
        true,
        dispatch,
        "OrderContext.useGivenExceedsBalance.first"
      );
      return;
    }

    const subtractedAmount = SundaeUtils.isAssetIdsEqual(
      state.assets.given.metadata.assetId,
      ADA_METADATA.assetId
    )
      ? MIN_ADA_WALLET_BALANCE
      : new AssetAmount(0n, state.assets.given.metadata);

    const balanceIsLessThanGiven =
      balance.subtract(subtractedAmount).amount < state.assets.given.amount;

    OrderActions.setGivenExceedsBalance(
      balanceIsLessThanGiven,
      dispatch,
      "OrderContext.useGivenExceedsBalance.second"
    );
  }, [loaded, balance?.amount, state.assets?.given?.amount]);
};
