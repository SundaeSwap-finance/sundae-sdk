import { describe, expect, it } from "bun:test";

import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import { BuilderLucidV3 } from "../../builders/lucid/Builder.Lucid.V3.class.js";
import { ComposerLucid } from "../Composer.Lucid.class.js";

describe("ComposerLucid", () => {
  it("should construct correctly", () => {
    const instance = new ComposerLucid(PREVIEW_DATA.addresses.current, [
      new BuilderLucidV3(),
      new BuilderLucidV3(),
      new BuilderLucidV3(),
    ]);
    expect(instance.builders).toBeArrayOfSize(3);
  });
});
