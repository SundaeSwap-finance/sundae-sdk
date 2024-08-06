import { useContext } from "react";

import { ComponentsContext } from "../state/components.js";

export const useComponentsContext = () => {
  try {
    const context = useContext(ComponentsContext);
    return context;
  } catch (e) {
    throw new Error(
      "Could not find the component's context. Make sure you have wrapped your component in <SundaeComponentsWrapper />."
    );
  }
};
