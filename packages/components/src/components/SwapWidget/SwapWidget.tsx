import { FC } from "react";

import { IWidgetWrapProps, WidgetWrap } from "../WidgetWrap/WidgetWrap.js";

export interface ISwapWidgetProps extends IWidgetWrapProps {}

export const SwapWidget: FC<ISwapWidgetProps> = ({ theme }) => {
  return (
    <WidgetWrap theme={theme}>
      <div>My widget</div>
    </WidgetWrap>
  );
};
