import { FC, PropsWithChildren } from "react";
import { useTheme } from "styled-components";

export const ErrorWrap: FC<PropsWithChildren> = ({ children }) => {
  try {
    useTheme();
  } catch (e) {
    throw new Error(
      "Could not find the component's styled-components context. Make sure you have wrapped your component in <SundaeComponentsWrapper />."
    );
  }

  return <>{children}</>;
};
