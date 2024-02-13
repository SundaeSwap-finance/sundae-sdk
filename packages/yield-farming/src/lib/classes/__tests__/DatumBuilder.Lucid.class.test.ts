import { jest } from "@jest/globals";

import { DatumBuilderLucid } from "../DatumBuilder.Lucid.class.js";
import { delegation } from "./data/delegation.js";

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
  it("should build an accurate lock datum with no delegation", () => {
    const result = builderInstance.buildLockDatum({
      owner: {
        address: ownerAddress,
      },
      programs: [],
    });

    expect(result.inline).toStrictEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff"
    );
  });
  it("should build an accurate lock datum", () => {
    const result = builderInstance.buildLockDatum({
      owner: {
        address: ownerAddress,
      },
      programs: delegation,
    });

    expect(result.inline).toStrictEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
    );
  });
  it("should build an accurate lock datum with just a payment credential", () => {
    const result = builderInstance.buildLockDatum({
      owner: {
        address:
          "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
      },
      programs: delegation,
    });

    expect(result.inline).toStrictEqual(
      "d8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
    );
  });
});
