import type { SundaeSDK } from "@sundaeswap/core";

import { IThemeSettings } from "./interfaces.js";

export interface IWidgetContextState {
  themes: {
    darkTheme: IThemeSettings;
    lightTheme: IThemeSettings;
  };
  sdk: SundaeSDK | null;
}
