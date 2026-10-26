import { FC, StrictMode } from "react";

import Actions from "./components/Actions";
import Loader from "./components/Loader";
import SettingsViewer from "./components/SettingsViewer";
import {
  AppStateProvider,
  IDetectedWallet,
  useAppState,
} from "./state/context";

const shortAddress = (address: string) =>
  `${address.slice(0, 12)}…${address.slice(-6)}`;

const WalletIcon: FC<{ wallet?: IDetectedWallet }> = ({ wallet }) =>
  wallet?.icon ? (
    <img src={wallet.icon} alt="" className="h-6 w-6 rounded" />
  ) : (
    <div className="h-6 w-6 rounded bg-slate-700" />
  );

/** The connected wallet, in the header. */
const WalletStatus: FC = () => {
  const { connection, wallets, activeWalletAddr, disconnect } = useAppState();
  if (connection.status !== "connected") {
    return (
      <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400">
        Not connected
      </span>
    );
  }
  const wallet = wallets.find(({ key }) => key === connection.wallet);
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
        Preview
      </span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
        <WalletIcon wallet={wallet} />
        <span className="font-mono text-sm" title={activeWalletAddr}>
          {shortAddress(activeWalletAddr)}
        </span>
      </div>
      <button
        className="text-sm text-slate-400 hover:text-white"
        onClick={disconnect}
      >
        Disconnect
      </button>
    </div>
  );
};

/** Shown until a wallet connects: the detected wallets, and why one failed. */
const ConnectPanel: FC = () => {
  const { wallets, connection, connect } = useAppState();

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-slate-700 bg-slate-800/60 p-8 shadow-xl">
      <h2 className="text-xl font-bold text-white">Connect a wallet</h2>
      <p className="mt-2 text-sm text-slate-400">
        Use a CIP-30 wallet set to the <strong>Preview</strong> network. Your
        wallet will ask you to approve this site.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {wallets.length === 0 && (
          <p className="rounded-lg border border-slate-700 p-4 text-sm text-slate-300">
            No Cardano wallet found. Install a wallet extension such as Eternl,
            unlock it, and reload this page.
          </p>
        )}
        {wallets.map((wallet) => {
          const connecting =
            connection.status === "connecting" &&
            connection.wallet === wallet.key;
          return (
            <button
              key={wallet.key}
              disabled={connection.status === "connecting"}
              onClick={() => connect(wallet.key)}
              className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-left transition-colors hover:border-blue-500 hover:bg-slate-800 disabled:opacity-60"
            >
              <WalletIcon wallet={wallet} />
              <span className="flex-1 font-semibold capitalize">
                {wallet.name}
              </span>
              {connecting && (
                <span className="flex items-center text-xs text-slate-400">
                  <Loader />
                  Check your wallet
                </span>
              )}
            </button>
          );
        })}
      </div>

      {connection.status === "error" && (
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Could not connect</p>
          <p className="mt-1 break-words">{connection.message}</p>
        </div>
      )}
    </div>
  );
};

export const App: FC = () => {
  const { connection } = useAppState();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              SundaeSwap SDK Demo
            </h1>
            <p className="text-sm text-slate-400">
              Build and submit protocol transactions from your wallet.
            </p>
          </div>
          <WalletStatus />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {connection.status === "connected" ? (
          <div className="flex w-full gap-10">
            <div className="w-1/3">
              <SettingsViewer />
            </div>
            <div className="w-2/3">
              <Actions />
            </div>
          </div>
        ) : (
          <ConnectPanel />
        )}
      </main>
    </div>
  );
};

export const Root = () => {
  return (
    <StrictMode>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </StrictMode>
  );
};

export default Root;
