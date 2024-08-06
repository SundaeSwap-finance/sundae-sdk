import { FC } from "react";

import { ErrorWrap } from "../components/ErrorWrap.js";
import { WidgetContainer } from "../components/WidgetContainer.js";

export interface ISwapWidgetProps {}

export const SwapComponent: FC = () => {
  return (
    <ErrorWrap>
      <WidgetContainer>My widget</WidgetContainer>
    </ErrorWrap>
  );
};
