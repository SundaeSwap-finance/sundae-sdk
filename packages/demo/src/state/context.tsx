import { Blaze, Blockfrost, Core, WebWallet } from "@blaze-cardano/sdk";
import { SundaeSDK } from "@sundaeswap/core";
import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/** A CIP-30 wallet the browser has injected under `window.cardano`. */
export interface IDetectedWallet {
  key: string;
  name: string;
  icon?: string;
}

export type TConnection =
  | { status: "disconnected" }
  | { status: "connecting"; wallet: string }
  | { status: "connected"; wallet: string }
  | { status: "error"; wallet?: string; message: string };

interface ICip30Wallet {
  name?: string;
  icon?: string;
  apiVersion?: string;
  enable: () => Promise<ConstructorParameters<typeof WebWallet>[0]>;
  isEnabled?: () => Promise<boolean>;
}

interface IAppState {
  SDK?: SundaeSDK;
  activeWalletAddr: string;
  ready: boolean;
  useReferral: boolean;
  setUseReferral: Dispatch<SetStateAction<boolean>>;
  useV3Contracts: boolean;
  setUseV3Contracts: Dispatch<SetStateAction<boolean>>;
  wallets: IDetectedWallet[];
  connection: TConnection;
  connect: (wallet: string) => Promise<void>;
  disconnect: () => void;
}

const defaultState: IAppState = {
  activeWalletAddr: "",
  ready: false,
  useReferral: false,
  setUseReferral: () => {},
  useV3Contracts: false,
  setUseV3Contracts: () => {},
  wallets: [],
  connection: { status: "disconnected" },
  connect: async () => {},
  disconnect: () => {},
};

const AppState = createContext(defaultState);

const LAST_WALLET_KEY = "sundae-demo:last-wallet";

// CIP-30 wallets inject themselves into this global; the DOM types don't
// declare it.
const cip30Window = window as Window & {
  cardano?: Record<string, ICip30Wallet>;
};
const injectedWallets = (): Record<string, ICip30Wallet> =>
  cip30Window.cardano ?? {};

/**
 * Every injected wallet that implements CIP-30. Wallets inject themselves
 * after the page starts loading, so this is read again until one appears.
 */
const detectWallets = (): IDetectedWallet[] =>
  Object.entries(injectedWallets())
    .filter(
      ([, wallet]) =>
        typeof wallet?.enable === "function" && wallet.apiVersion !== undefined,
    )
    .map(([key, wallet]) => ({
      key,
      name: wallet.name ?? key,
      icon: wallet.icon,
    }));

/**
 * The `defaultValue` property is for tests.
 */
export const AppStateProvider: FC<
  PropsWithChildren<{ defaultValue?: Partial<IAppState> }>
> = ({ children, defaultValue }) => {
  const [SDK, setSDK] = useState<SundaeSDK>();
  const [activeWalletAddr, setActiveWalletAddr] = useState("");
  const [useReferral, setUseReferral] = useState(false);
  const [useV3Contracts, setUseV3Contracts] = useState(false);
  const [wallets, setWallets] = useState<IDetectedWallet[]>([]);
  const [connection, setConnection] = useState<TConnection>({
    status: "disconnected",
  });

  // A wallet that never answers `enable()` leaves its promise pending forever.
  // Each attempt gets a number; a cancelled or superseded attempt's result is
  // dropped when it eventually settles.
  const attemptRef = useRef(0);

  const connect = useCallback(async (key: string) => {
    const attempt = ++attemptRef.current;
    const isStale = () => attempt !== attemptRef.current;
    setConnection({ status: "connecting", wallet: key });
    setSDK(undefined);
    try {
      const wallet = injectedWallets()[key];
      if (!wallet) {
        throw new Error(`${key} is not installed in this browser.`);
      }
      const api = await wallet.enable();
      if (isStale()) {
        return;
      }

      const address =
        (await api.getUsedAddresses())?.[0] ??
        (await api.getUnusedAddresses())?.[0];
      if (!address) {
        throw new Error("The wallet returned no address.");
      }
      const activeAddress = Core.Address.fromString(address);
      if (!activeAddress) {
        throw new Error(`Could not read the wallet address ${address}.`);
      }

      const mainnet = activeAddress.getNetworkId() === 1;
      const projectId: string | undefined = mainnet
        ? // @ts-expect-error No types.
          window.__APP_CONFIG.blockfrostAPIMainnet
        : // @ts-expect-error No types.
          window.__APP_CONFIG.blockfrostAPIPreview;
      if (!projectId) {
        throw new Error(
          `No Blockfrost key for ${mainnet ? "mainnet" : "preview"}. Set ` +
            `BLOCKFROST_API_KEY_${mainnet ? "MAINNET" : "PREVIEW"} in ` +
            "packages/demo/.env and restart the dev server.",
        );
      }

      const blazeInstance = await Blaze.from(
        new Blockfrost({
          network: mainnet ? "cardano-mainnet" : "cardano-preview",
          projectId,
        }),
        new WebWallet(api),
      );
      if (isStale()) {
        return;
      }

      setActiveWalletAddr(activeAddress.toBech32());
      setSDK(SundaeSDK.new({ blazeInstance, debug: true }));
      setConnection({ status: "connected", wallet: key });
      localStorage.setItem(LAST_WALLET_KEY, key);
    } catch (e) {
      if (isStale()) {
        return;
      }
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "info" in e
            ? String(e.info)
            : String(e);
      setConnection({ status: "error", wallet: key, message });
    }
  }, []);

  const disconnect = useCallback(() => {
    attemptRef.current += 1;
    localStorage.removeItem(LAST_WALLET_KEY);
    setSDK(undefined);
    setActiveWalletAddr("");
    setConnection({ status: "disconnected" });
  }, []);

  // Find the injected wallets, and reconnect the last one used if it still
  // trusts this site (so a reload doesn't ask again).
  useEffect(() => {
    let attempts = 0;
    let reconnected = false;
    const scan = async () => {
      const found = detectWallets();
      setWallets(found);
      const last = localStorage.getItem(LAST_WALLET_KEY);
      if (!reconnected && last && found.some(({ key }) => key === last)) {
        reconnected = true;
        if (await injectedWallets()[last].isEnabled?.()) {
          await connect(last);
        }
      }
      return found.length > 0;
    };
    const timer = setInterval(async () => {
      attempts += 1;
      if ((await scan()) || attempts >= 10) {
        clearInterval(timer);
      }
    }, 300);
    void scan();
    return () => clearInterval(timer);
  }, [connect]);

  return (
    <AppState.Provider
      value={{
        activeWalletAddr,
        SDK,
        ready: connection.status === "connected",
        useReferral,
        setUseReferral,
        useV3Contracts,
        setUseV3Contracts,
        wallets,
        connection,
        connect,
        disconnect,
        ...defaultValue,
      }}
    >
      {children}
    </AppState.Provider>
  );
};

export const useAppState = () => useContext(AppState);
