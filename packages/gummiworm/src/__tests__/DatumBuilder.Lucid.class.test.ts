import { jest } from "@jest/globals";

import { DatumBuilderLucid } from "../Classes/DatumBuilder.Lucid.class.js";

let builderInstance: DatumBuilderLucid;

beforeEach(() => {
  builderInstance = new DatumBuilderLucid("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

const ownerAddress =
  "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s";

describe("DatumBuilderLucid", () => {
  it("should pass", () => {
    expect(true).toBeTruthy();
  });
});
