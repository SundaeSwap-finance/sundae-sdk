import { EContractVersion } from "@sundaeswap/core";
import merge from "lodash/merge";
import {
  Context,
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from "react";

import { useOrderEffects } from "./hooks/useOrderEffects.js";
import { reducer } from "./reducer.js";
import {
  EOrderFlowState,
  IOrderContext,
  IOrderContextProviderProps,
  IOrderState,
} from "./types.js";

export const defaultOrderState: IOrderState = {
  assets: {},
  derived: {
    givenExceedsBalance: false,
    takenExceedsReserves: false,
  },
  flowData: {
    orderConsent: { checked: false, i18nKey: undefined },
    flowState: EOrderFlowState.initial,
    contractVersion: EContractVersion.V1,
  },
};

const OrderContext: Context<IOrderContext> = createContext({
  state: defaultOrderState,
  dispatch: (_val) => {},
});

const OrderContextEffects: FC<PropsWithChildren> = ({ children }) => {
  // Effects that apply only to the nearest OrderContext.
  useOrderEffects();

  return <>{children}</>;
};

/**
 * Context Provider for managing and sharing order state across the application.
 * It uses a reducer for managing state transitions based on dispatched actions.
 *
 * @function
 * @param {React.PropsWithChildren<IOrderState>} props - The properties that define the initial order state and children elements.
 * @param {React.ReactNode} props.children - React child components or elements.
 * @param {IOrderState} seed - The initial order state values which are used to override the default order state.
 * @returns {ReactElement} Returns a React Element wrapped within the OrderContext.Provider, providing the order state and dispatch function to all child components.
 */
export const OrderContextProvider: FC<
  PropsWithChildren<IOrderContextProviderProps>
> = ({ children, seed = {} }) => {
  const [state, dispatch] = useReducer(
    reducer,
    merge({}, defaultOrderState, seed)
  );
  const memoizedDispatch = useMemo(() => dispatch, []);

  return (
    <OrderContext.Provider value={{ state, dispatch: memoizedDispatch }}>
      <OrderContextEffects>{children}</OrderContextEffects>
    </OrderContext.Provider>
  );
};

// Utility hook.
export const useOrderContext = (): IOrderContext => useContext(OrderContext);
