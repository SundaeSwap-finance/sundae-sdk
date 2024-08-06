import { AssetAmount, AssetRatio } from "@sundaeswap/asset";
import { EContractVersion } from "@sundaeswap/core";
import { Dispatch } from "react";

import { IAssetMetadata } from "../../types/assets";
import {
  EOrderActions,
  EOrderFlowState,
  EOrderTransactionBuilderState,
  IOrderAction,
  IOrderFlowConsent,
  IOrderStateTransaction,
} from "./types";

type TActionFunc<T> = (
  value: T,
  dispatch: Dispatch<IOrderAction>,
  key?: string
) => void;

const setAdaAfterSwap: TActionFunc<AssetAmount> = (
  adaAfterSwap,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_ADA_AFTER_SWAP,
    payload: { adaAfterSwap },
  });

const setGivenAmount: TActionFunc<AssetAmount<IAssetMetadata> | undefined> = (
  given,
  dispatch,
  key
) =>
  dispatch({ key, type: EOrderActions.SET_GIVEN_AMOUNT, payload: { given } });

const setTakenAmount: TActionFunc<AssetAmount<IAssetMetadata> | undefined> = (
  taken,
  dispatch,
  key
) =>
  dispatch({ key, type: EOrderActions.SET_TAKEN_AMOUNT, payload: { taken } });

const setRatio: TActionFunc<AssetRatio<IAssetMetadata> | undefined> = (
  ratio,
  dispatch,
  key
) => dispatch({ key, type: EOrderActions.SET_RATIO, payload: { ratio } });

const setGivenExceedsBalance: TActionFunc<boolean> = (
  givenExceedsBalance,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_GIVEN_EXCEEDS_BALANCE,
    payload: { givenExceedsBalance },
  });

const setOrderFlowState: TActionFunc<EOrderFlowState> = (
  flowState,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_ORDER_FLOW_STATE,
    payload: { flowState },
  });

const setOrderConsent: TActionFunc<Partial<IOrderFlowConsent>> = (
  orderConsent,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_ORDER_CONSENT,
    payload: { orderConsent },
  });

const swapOrderDirection = (dispatch: Dispatch<IOrderAction>, key?: string) =>
  dispatch({ key, type: EOrderActions.SWAP_ORDER_DIRECTION });

const setTransaction: TActionFunc<Partial<IOrderStateTransaction>> = (
  transaction,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_TRANSACTION,
    payload: { transaction },
  });

const setTransactionState: TActionFunc<EOrderTransactionBuilderState> = (
  transactionState,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_TRANSACTION_STATE,
    payload: { transactionState },
  });

const resetOrderFlow = (dispatch: Dispatch<IOrderAction>, key?: string) =>
  dispatch({ key, type: EOrderActions.RESET_ORDER_FLOW });

const setContractVersion: TActionFunc<EContractVersion> = (
  contractVersion,
  dispatch,
  key
) =>
  dispatch({
    key,
    type: EOrderActions.SET_PROTOCOL_VERSION,
    payload: { contractVersion },
  });

export const OrderActions = {
  swapOrderDirection,
  resetOrderFlow,
  setAdaAfterSwap,
  setGivenAmount,
  setGivenExceedsBalance,
  setOrderConsent,
  setOrderFlowState,
  setRatio,
  setTakenAmount,
  setTransaction,
  setTransactionState,
  setContractVersion,
};
