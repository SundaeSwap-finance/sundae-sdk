import type { SundaeSDK } from "@sundaeswap/core";
import { FC, PropsWithChildren, useMemo } from "react";
import { ThemeProvider } from "styled-components";

import { useActiveTheme } from "../hooks/useActiveTheme.js";
import { ComponentContextProvider } from "../state/components.js";
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME } from "../theme.js";
import { IThemeSettings } from "../types/interfaces.js";

export interface IWidgetWrapProps extends PropsWithChildren {
  lightTheme?: IThemeSettings;
  darkTheme?: IThemeSettings;
  sdk: SundaeSDK;
}

const WrapWithTheme: FC<PropsWithChildren> = ({ children }) => {
  const theme = useActiveTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const SundaeComponentsProvider: FC<IWidgetWrapProps> = ({
  lightTheme,
  darkTheme,
  sdk,
  children,
}) => {
  const memoizedState = useMemo(() => {
    return {
      themes: {
        darkTheme: darkTheme || DEFAULT_DARK_THEME,
        lightTheme: lightTheme || DEFAULT_LIGHT_THEME,
      },
      sdk,
    };
  }, [lightTheme, darkTheme, sdk]);

  return (
    <ComponentContextProvider state={memoizedState}>
      <WrapWithTheme>{children}</WrapWithTheme>
    </ComponentContextProvider>
  );
};
