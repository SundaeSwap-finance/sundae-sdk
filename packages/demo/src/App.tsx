import { FC, StrictMode } from "react";

import Actions from "./components/Actions";
import SettingsViewer from "./components/SettingsViewer";
import { AppStateProvider, useAppState } from "./state/context";

export const App: FC = () => {
  const { wallet, setWallet } = useAppState();
  return (
    <div className="container flex flex-col gap-10">
      <div className="flex w-full gap-10">
        <div className="w-1/3">
          <select value={wallet} onChange={(e) => setWallet(e.target.value)}>
            <option value="eternl">Eternl</option>
            <option value="sorbet">Sorbet</option>
          </select>
          <SettingsViewer />
        </div>
        <div className="w-2/3">
          <Actions />
        </div>
      </div>
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
