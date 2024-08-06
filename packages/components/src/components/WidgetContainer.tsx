import { FC, PropsWithChildren } from "react";
import styled from "styled-components";

const WidgetContainerDiv = styled.div`
  padding: 20px;
  border-radius: 10px;
  background: ${(props) => props.theme.backgroundColor};
`;

export const WidgetContainer: FC<PropsWithChildren> = ({ children }) => {
  return <WidgetContainerDiv>{children}</WidgetContainerDiv>;
};
