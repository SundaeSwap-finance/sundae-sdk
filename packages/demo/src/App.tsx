import { FC, StrictMode } from "react";

import { Home } from "./components/Actions/Home";
import Settings from "./components/Settings";
import SettingsViewer from "./components/SettingsViewer";
import { AppStateProvider } from "./state/context";

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
          <Home />
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
