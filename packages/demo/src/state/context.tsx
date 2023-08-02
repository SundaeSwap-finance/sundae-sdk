import { SundaeSDK } from "@sundaeswap/sdk-core";
import { getAddressDetails } from "lucid-cardano";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { FC, PropsWithChildren } from "react";
import { createContext } from "react";

interface IAppState {
  SDK?: SundaeSDK;
  setSDK: Dispatch<SetStateAction<SundaeSDK | undefined>>;
  walletAddress: string;
  ready: boolean;
  setReady: Dispatch<SetStateAction<boolean>>;
  useReferral: boolean;
  setUseReferral: Dispatch<SetStateAction<boolean>>;
}

const defaultState: IAppState = {
  setSDK: () => {},
  walletAddress: "",
  ready: false,
  setReady: () => {},
  useReferral: false,
  setUseReferral: () => {},
};

const AppState = createContext(defaultState);

/**
 * The `defaultValue` property is for tests.
 */
export const AppStateProvider: FC<
  PropsWithChildren<{ defaultValue?: Partial<IAppState> }>
> = ({ children, defaultValue }) => {
  const [SDK, setSDK] = useState<SundaeSDK>();
  const [ready, setReady] = useState<boolean>(false);
  const [activeWallet, setActiveWallet] = useState("");
  const [useReferral, setUseReferral] = useState(false);

  useEffect(() => {
    (async () => {
      const api = await window.cardano?.eternl.enable();
      if (!api) {
        return;
      }

      const address = (await api.getUsedAddresses())?.[0];
      const {
        address: { bech32 },
      } = getAddressDetails(address);
      setActiveWallet(bech32);
      setReady(true);
    })();
  }, []);

  return (
    <AppState.Provider
      value={{
        walletAddress: activeWallet,
        SDK,
        setSDK,
        ready,
        setReady,
        useReferral,
        setUseReferral,
        ...defaultValue,
      }}
    >
      {children}
    </AppState.Provider>
  );
};

export const useAppState = () => useContext(AppState);
