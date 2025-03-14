import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { EXPECTATIONS } from "../__data__/datumbuilder.expectations.blaze.js";
import { YieldFarmingDatumBuilder } from "../YieldFarmingDatumBuilder.class.js";

let builderInstance: YieldFarmingDatumBuilder;

beforeEach(() => {
  builderInstance = new YieldFarmingDatumBuilder("preview");
});

afterEach(() => {
  mock.restore();
});

describe("YieldFarmingDatumBuilder", () => {
  it("should build an accurate lock datum with no delegation", () => {
    const result = builderInstance.buildLockDatum(
      EXPECTATIONS.buildLockDatum[0].args,
    );

    expect(result.inline).toStrictEqual(
      EXPECTATIONS.buildLockDatum[0].expectations.inline,
    );
    expect(result.hash).toStrictEqual(
      EXPECTATIONS.buildLockDatum[0].expectations.hash,
    );
  });
  it("should build an accurate lock datum", () => {
    const result = builderInstance.buildLockDatum(
      EXPECTATIONS.buildLockDatum[1].args,
    );

    expect(result.inline).toStrictEqual(
      EXPECTATIONS.buildLockDatum[1].expectations.inline,
    );
    expect(result.hash).toStrictEqual(
      EXPECTATIONS.buildLockDatum[1].expectations.hash,
    );
  });
  it("should build an accurate lock datum with just a payment credential", () => {
    const result = builderInstance.buildLockDatum(
      EXPECTATIONS.buildLockDatum[2].args,
    );

    expect(result.inline).toStrictEqual(
      EXPECTATIONS.buildLockDatum[2].expectations.inline,
    );
    expect(result.hash).toStrictEqual(
      EXPECTATIONS.buildLockDatum[2].expectations.hash,
    );
  });
});
