import { FC, StrictMode } from "react";
import { AppStateProvider, useAppState } from "./state/context";
import Settings from "./components/Settings";
import SettingsViewer from "./components/SettingsViewer";

export const App: FC = () => {
  const { SDK } = useAppState();

  return (
    <div className="container flex flex-col gap-10">
      <div className="w-full">
        <Settings />
      </div>
      <div className="flex w-full gap-10">
        <div className="w-1/3">{SDK && <SettingsViewer />}</div>
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
