import { AssetAmount, AssetRatio } from "@sundaeswap/asset";
import {
  EContractVersion,
  IComposedTx,
  ITxBuilderSign,
} from "@sundaeswap/core";
import { TSwapOutcome } from "@sundaeswap/cpp";
import type { Tx, TxComplete } from "lucid-cardano";
import { Dispatch, ReactNode } from "react";

import { IAssetMetadata } from "../../types/assets.js";
import { TDeepPartial } from "../../types/misc.js";

export enum EOrderActions {
  RESET_ORDER_FLOW = "RESET_ORDER_FLOW",
  SET_ADA_AFTER_SWAP = "SET_ADA_AFTER_SWAP",
  SET_GIVEN_AMOUNT = "SET_GIVEN_AMOUNT",
  SET_GIVEN_EXCEEDS_BALANCE = "SET_GIVEN_EXCEEDS_BALANCE",
  SET_ORDER_CONSENT = "SET_ORDER_CONSENT",
  SET_ORDER_FLOW_STATE = "SET_ORDER_FLOW_STATE",
  SET_RATIO = "SET_RATIO",
  SET_TAKEN_AMOUNT = "SET_TAKEN_AMOUNT",
  SET_TAKEN_EXCEEDS_RESERVES = "SET_TAKEN_EXCEEDS_RESERVES",
  SET_TRANSACTION = "SET_TRANSACTION",
  SET_TRANSACTION_STATE = "SET_TRANSACTION_STATE",
  SWAP_ORDER_DIRECTION = "SWAP_ORDER_DIRECTION",
  SET_PROTOCOL_VERSION = "SET_PROTOCOL_VERSION",
}

export enum EOrderType {
  market = "market",
}

export enum EOrderTransactionBuilderState {
  BUILD = "BUILD",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export enum EOrderFlowState {
  initial = "initial",
  preview = "preview",
  previewCancelled = "previewCancelled",
  submitting = "submitting",
  submittingCancelled = "submittingCancelled",
  success = "success",
  error = "error",
  reset = "reset",
}

export interface ITransactionErrorActions {
  resolutionAction: () => void;
  resolutionButtonText: ReactNode;
}

export interface IOrderTransactionErrorState {
  actions?: ITransactionErrorActions;
  message?: ReactNode;
}

export interface IOrderStateTransaction {
  builtTx?: IComposedTx<Tx, TxComplete>;
  completeTx?: ITxBuilderSign<TxComplete>;
  state?: EOrderTransactionBuilderState;
  error?: IOrderTransactionErrorState;
}

export interface IOrderAction {
  type: string;
  // Payload types are enforced in ./actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  // Optional dispatch key to make tracing easier.
  key?: string;
}

export interface IOrderFlowConsent {
  checked: boolean;
  i18nKey?: string;
}

export interface IOrderState {
  assets: {
    given?: AssetAmount<IAssetMetadata>;
    taken?: AssetAmount<IAssetMetadata>;
  };
  derived: {
    adaAfterSwap?: AssetAmount<IAssetMetadata>;
    givenExceedsBalance: boolean;
    swapOutcome?: TSwapOutcome[];
    takenExceedsReserves: boolean;
    transaction?: IOrderStateTransaction;
  };
  flowData: {
    flowState: EOrderFlowState;
    orderConsent: IOrderFlowConsent;
    contractVersion: EContractVersion; // TODO: remove
  };
  ratio?: AssetRatio<IAssetMetadata>;
}

export interface IOrderContext {
  state: IOrderState;
  dispatch: Dispatch<IOrderAction>;
}

export interface IOrderContextProviderProps {
  seed?: TDeepPartial<IOrderState>;
}
