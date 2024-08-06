import { FC, PropsWithChildren } from "react";

import { ThemeProvider } from "styled-components";
import { useActiveTheme } from "../hooks/useActiveTheme.js";
import { ComponentContextProvider } from "../state/context.js";
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME } from "../theme.js";
import { IThemeSettings } from "../types/interfaces.js";

export interface IWidgetWrapProps extends PropsWithChildren {
  lightTheme?: IThemeSettings;
  darkTheme?: IThemeSettings;
}

const WrapWithTheme: FC<PropsWithChildren> = ({ children }) => {
  const theme = useActiveTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const SundaeComponentsProvider: FC<IWidgetWrapProps> = ({
  lightTheme,
  darkTheme,
  children,
}) => {
  return (
    <ComponentContextProvider
      state={{
        themes: {
          darkTheme: darkTheme || DEFAULT_DARK_THEME,
          lightTheme: lightTheme || DEFAULT_LIGHT_THEME,
        },
      }}
    >
      <WrapWithTheme>{children}</WrapWithTheme>
    </ComponentContextProvider>
  );
};
