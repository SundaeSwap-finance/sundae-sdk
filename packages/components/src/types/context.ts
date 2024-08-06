import { IThemeSettings } from "./interfaces.js";

export interface IWidgetContextState {
  themes: {
    darkTheme: IThemeSettings;
    lightTheme: IThemeSettings;
  };
}
