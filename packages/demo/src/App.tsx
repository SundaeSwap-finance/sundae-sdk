import { FC, StrictMode } from "react";

import { AppStateProvider } from "./state/context";
import Settings from "./components/Settings";
import SettingsViewer from "./components/SettingsViewer";
import Actions from "./components/Actions";

export const App: FC = () => {
  return (
    <div className="container flex flex-col gap-10">
      <div className="w-full">
        <Settings />
      </div>
      <div className="flex w-full gap-10">
        <div className="w-1/3">
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
