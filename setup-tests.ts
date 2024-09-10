import { mock } from "bun:test";

global.jest = {
  // @ts-ignore
  fn: mock,
};

import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register({
  url: "https://app.sundae.fi",
});
