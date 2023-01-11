import type { SundaeSDK } from "@sundae/sdk-core";
import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useContext } from "react";
import { FC, PropsWithChildren } from "react";
import { createContext } from "react";

interface IAppState {
  SDK?: SundaeSDK;
  setSDK: Dispatch<SetStateAction<SundaeSDK | undefined>>;
}

const defaultState: IAppState = {
  setSDK: () => {},
};

const AppState = createContext(defaultState);

export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [SDK, setSDK] = useState<SundaeSDK>();

  return (
    <AppState.Provider
      value={{
        SDK,
        setSDK,
      }}
    >
      {children}
    </AppState.Provider>
  );
};

export const useAppState = () => useContext(AppState);