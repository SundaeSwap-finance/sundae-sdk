import { jest } from "@jest/globals";

import { EXPECTATIONS } from "../__data__/datumbuilder.expectations.lucid.js";
import { DatumBuilderLucid } from "../DatumBuilder.YieldFarming.Lucid.class.js";

let builderInstance: DatumBuilderLucid;

beforeEach(() => {
  builderInstance = new DatumBuilderLucid("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("DatumBuilderLucid", () => {
  it("should build an accurate lock datum with no delegation", () => {
    const result = builderInstance.buildLockDatum(
      EXPECTATIONS.buildLockDatum[0].args
    );

    expect(result.inline).toStrictEqual(
      EXPECTATIONS.buildLockDatum[0].expectations.inline
    );
    expect(result.hash).toStrictEqual(
      EXPECTATIONS.buildLockDatum[0].expectations.hash
    );
  });
  it("should build an accurate lock datum", () => {
    const result = builderInstance.buildLockDatum(
      EXPECTATIONS.buildLockDatum[1].args
    );

    expect(result.inline).toStrictEqual(
      EXPECTATIONS.buildLockDatum[1].expectations.inline
    );
    expect(result.hash).toStrictEqual(
      EXPECTATIONS.buildLockDatum[1].expectations.hash
    );
  });
  it("should build an accurate lock datum with just a payment credential", () => {
    const result = builderInstance.buildLockDatum(
      EXPECTATIONS.buildLockDatum[2].args
    );

    expect(result.inline).toStrictEqual(
      EXPECTATIONS.buildLockDatum[2].expectations.inline
    );
    expect(result.hash).toStrictEqual(
      EXPECTATIONS.buildLockDatum[2].expectations.hash
    );
  });
});
