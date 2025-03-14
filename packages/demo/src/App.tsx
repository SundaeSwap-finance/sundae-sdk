import { FC, StrictMode } from "react";

import Actions from "./components/Actions";
import SettingsViewer from "./components/SettingsViewer";
import { AppStateProvider } from "./state/context";

export const App: FC = () => {
  return (
    <div className="container flex flex-col gap-10">
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
