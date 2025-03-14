import { Blaze, Blockfrost, Core, WebWallet } from "@blaze-cardano/sdk";
import { SundaeSDK } from "@sundaeswap/core";
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
  network: 0 | 1;
  setNetwork: Dispatch<SetStateAction<0 | 1>>;
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
  network: 0,
  setNetwork: () => {},
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
  const [network, setNetwork] = useState<0 | 1>(0);

  useEffect(() => {
    (async () => {
      // @ts-expect-error Cardano is not defined by default.
      const api = await window.cardano?.eternl.enable();
      if (!api) {
        return;
      }

      setReady(false);

      const address =
        (await api.getUsedAddresses())?.[0] ??
        (await api.getUnusedAddresses())?.[0];

      const activeAddress = Core.Address.fromString(address);
      if (activeAddress) {
        setActiveWalletAddr(activeAddress.toBech32());
        const paymentHash = activeAddress
          .asBase()
          ?.getPaymentCredential().hash;
        const enterprise =
          paymentHash &&
          new Core.Address({
            type: Core.AddressType.EnterpriseKey,
            paymentPart: {
              hash: Core.Hash28ByteBase16(paymentHash),
              type: Core.CredentialType.KeyHash,
            },
            networkId: network,
          });
        if (enterprise) {
          setNonStakedWalletAddr(enterprise.toBech32());
        }
      }

      const blazeInstance = await Blaze.from(
        new Blockfrost({
          network: network ? "cardano-mainnet" : "cardano-preview",
          projectId: network
            ? // @ts-expect-error No types.
              window.__APP_CONFIG.blockfrostAPIMainnet
            : // @ts-expect-error No types.
              window.__APP_CONFIG.blockfrostAPIPreview,
        }),
        new WebWallet(api),
      );

      const sdk = SundaeSDK.new({
        blazeInstance,
        debug: true
      });

      setSDK(sdk);

      setReady(true);
    })();
  }, [network]);

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
        network,
        setNetwork,
        ...defaultValue,
      }}
    >
      {children}
    </AppState.Provider>
  );
};

export const useAppState = () => useContext(AppState);
