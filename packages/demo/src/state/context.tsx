import { SundaeSDK } from "@sundaeswap/core";
import { C, getAddressDetails } from "lucid-cardano";
import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface IAppState {
  SDK?: SundaeSDK;
  setSDK: Dispatch<SetStateAction<SundaeSDK | undefined>>;
  activeWalletAddr: string;
  nonStakedWalletAddr: string;
  ready: boolean;
  setReady: Dispatch<SetStateAction<boolean>>;
  useReferral: boolean;
  setUseReferral: Dispatch<SetStateAction<boolean>>;
  useV3Contracts: boolean;
  setUseV3Contracts: Dispatch<SetStateAction<boolean>>;
}

const defaultState: IAppState = {
  setSDK: () => {},
  activeWalletAddr: "",
  nonStakedWalletAddr: "",
  ready: false,
  setReady: () => {},
  useReferral: false,
  setUseReferral: () => {},
  useV3Contracts: false,
  setUseV3Contracts: () => {},
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
  const [activeWalletAddr, setActiveWalletAddr] = useState("");
  const [nonStakedWalletAddr, setNonStakedWalletAddr] = useState("");
  const [useReferral, setUseReferral] = useState(false);
  const [useV3Contracts, setUseV3Contracts] = useState(false);

  useEffect(() => {
    (async () => {
      const api = await window.cardano?.eternl.enable();
      if (!api) {
        return;
      }

      const address =
        (await api.getUsedAddresses())?.[0] ??
        (await api.getUnusedAddresses())?.[0];
      const {
        address: { bech32 },
        paymentCredential,
      } = getAddressDetails(address);
      setActiveWalletAddr(bech32);

      const keyhash = C.Ed25519KeyHash.from_hex(
        paymentCredential?.hash as string
      );

      const enterprise = C.EnterpriseAddress.new(
        0,
        C.StakeCredential.from_keyhash(keyhash)
      )
        ?.to_address()
        .to_bech32("addr_test");

      setNonStakedWalletAddr(enterprise);
      setReady(true);
    })();
  }, []);

  return (
    <AppState.Provider
      value={{
        activeWalletAddr,
        nonStakedWalletAddr,
        SDK,
        setSDK,
        ready,
        setReady,
        useReferral,
        setUseReferral,
        useV3Contracts,
        setUseV3Contracts,
        ...defaultValue,
      }}
    >
      {children}
    </AppState.Provider>
  );
};

export const useAppState = () => useContext(AppState);
