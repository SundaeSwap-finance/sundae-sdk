import { mock } from "bun:test";

global.jest = {
  // @ts-expect-error Not exact matches.
  fn: mock,
};

import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register({
  url: "https://app.sundae.fi",
});
