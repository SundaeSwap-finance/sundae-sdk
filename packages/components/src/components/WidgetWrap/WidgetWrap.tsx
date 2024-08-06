import { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "styled-components";

import { IThemeSettings } from "../../types/interfaces.js";

export interface IWidgetWrapProps extends PropsWithChildren {
  theme: IThemeSettings;
}

export const WidgetWrap: FC<IWidgetWrapProps> = ({ theme, children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
