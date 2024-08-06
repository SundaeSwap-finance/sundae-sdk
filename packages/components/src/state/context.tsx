import { createContext, FC, PropsWithChildren } from "react";

import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME } from "../theme.js";
import { IWidgetContextState as IComponentsContextState } from "../types/context.js";

const defaultContext: IComponentsContextState = {
  themes: {
    darkTheme: DEFAULT_DARK_THEME,
    lightTheme: DEFAULT_LIGHT_THEME,
  },
};

export const ComponentsContext = createContext(defaultContext);

export const ComponentContextProvider: FC<
  PropsWithChildren<{ state?: IComponentsContextState }>
> = ({ children, state }) => {
  return (
    <ComponentsContext.Provider value={state || defaultContext}>
      {children}
    </ComponentsContext.Provider>
  );
};
