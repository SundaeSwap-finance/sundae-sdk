import { useMemo } from "react";

import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME } from "../theme.js";
import { useComponentsContext } from "./useComponentsContext.js";

export const useActiveTheme = () => {
  const { themes } = useComponentsContext();
  const preferredScheme = useMemo(() => {
    if (!window.matchMedia) {
      return "dark";
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    return mediaQuery.matches ? "dark" : "light";
  }, []);

  const theme = useMemo(() => {
    const doc = window.document.documentElement;
    const darkMode =
      doc.classList.contains("dark") || preferredScheme === "dark";

    if (darkMode) {
      return themes?.darkTheme || DEFAULT_DARK_THEME;
    }

    return themes?.lightTheme || DEFAULT_LIGHT_THEME;
  }, [preferredScheme, themes]);

  return theme;
};
