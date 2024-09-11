import { ETxBuilderType, SundaeSDK } from "@sundaeswap/core";
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
  builderLib: ETxBuilderType;
  setBuilderLib: Dispatch<SetStateAction<ETxBuilderType>>;
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
  builderLib: ETxBuilderType.LUCID,
  setBuilderLib: () => {},
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
  const [builderLib, setBuilderLib] = useState<ETxBuilderType>(
    ETxBuilderType.BLAZE,
  );
  const [network, setNetwork] = useState<0 | 1>(0);

  useEffect(() => {
    (async () => {
      const api = await window.cardano?.eternl.enable();
      if (!api) {
        return;
      }

      const address =
        (await api.getUsedAddresses())?.[0] ??
        (await api.getUnusedAddresses())?.[0];

      setReady(false);
      if (builderLib === ETxBuilderType.LUCID) {
        const { getAddressDetails, C } = await import("lucid-cardano");
        const {
          address: { bech32 },
          paymentCredential,
        } = getAddressDetails(address);
        setActiveWalletAddr(bech32);

        const keyhash = C.Ed25519KeyHash.from_hex(
          paymentCredential?.hash as string,
        );

        const enterprise = C.EnterpriseAddress.new(
          0,
          C.StakeCredential.from_keyhash(keyhash),
        )
          ?.to_address()
          .to_bech32("addr_test");

        setNonStakedWalletAddr(enterprise);
      } else if (builderLib === ETxBuilderType.BLAZE) {
        const { Core } = await import("@blaze-cardano/sdk");
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
      }

      setReady(true);
    })();
  }, [builderLib, network]);

  return (
    <AppState.Provider
      value={{
        activeWalletAddr,
        builderLib,
        setBuilderLib,
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
