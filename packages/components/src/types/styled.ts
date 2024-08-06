// import original module declarations
import "styled-components";

import { IThemeSettings } from "./interfaces.js";

// and extend them!
declare module "styled-components" {
  // eslint-disable-next-line
  export interface DefaultTheme extends IThemeSettings {}
}
