import { createRoot } from "react-dom/client";

import "./styles";

import("./App").then((App) => {
  const target = document.querySelector("#app");
  if (target) {
    const root = createRoot(target);
    root.render(<App.default />);
  }
});
