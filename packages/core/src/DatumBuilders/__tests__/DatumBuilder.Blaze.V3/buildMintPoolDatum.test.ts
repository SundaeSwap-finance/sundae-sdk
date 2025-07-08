import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";

import {
  DatumBuilderV3,
  IDatumBuilderMintPoolV3Args,
} from "../../DatumBuilder.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderV3;

beforeEach(() => {
  builderInstance = new DatumBuilderV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("builderMintPoolDatum()", () => {
  it("should build the pool mint datum properly", () => {
    const spiedOnComputePoolId = spyOn(DatumBuilderV3, "computePoolId");
    const spiedOnBuildLexicographicalAssetsDatum = spyOn(
      DatumBuilderV3.prototype,
      "buildLexicographicalAssetsDatum",
    );

    const { inline, hash } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[0].args,
    );

    expect(spiedOnComputePoolId).toHaveBeenNthCalledWith(
      ...(V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.calledWith as [
        number,
        IDatumBuilderMintPoolV3Args["seedUtxo"],
      ]),
    );
    expect(spiedOnComputePoolId).toHaveReturnedTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .returnedWith[0] as number,
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .buildLexicographicalAssetsDatumCalls,
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.inline,
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.hash,
    );
  });

  it("should build the pool mint datum properly with split fees", () => {
    const spiedOnComputePoolId = spyOn(DatumBuilderV3, "computePoolId");
    const spiedOnBuildLexicographicalAssetsDatum = spyOn(
      DatumBuilderV3.prototype,
      "buildLexicographicalAssetsDatum",
    );

    const { inline, hash } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[1].args,
    );

    expect(spiedOnComputePoolId).toHaveReturnedTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations
        .returnedWith[0] as number,
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations
        .buildLexicographicalAssetsDatumCalls,
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.inline,
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.hash,
    );
  });

  it("should build the pool mint datum with feeManager address (non-script)", () => {
    const feeManagerAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Address" in schema.feeManager) {
      expect(schema.feeManager.Address).toHaveProperty("hex");
      expect(typeof schema.feeManager.Address.hex).toBe("string");
      expect(schema.feeManager.Address.hex.length).toBeGreaterThan(0);
    } else {
      expect().fail("Expected feeManager to be an Address type");
    }
  });

  it("should build the pool mint datum with feeManager script address", () => {
    const feeManagerScriptAddress =
      "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0";
    const argsWithFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerScriptAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Script" in schema.feeManager) {
      expect(schema.feeManager.Script).toHaveProperty("hex");
      expect(typeof schema.feeManager.Script.hex).toBe("string");
      expect(schema.feeManager.Script.hex.length).toBeGreaterThan(0);
    } else {
      expect().fail("Expected feeManager to be a Script type");
    }
  });

  it("should build the pool mint datum with another script address", () => {
    const feeManagerScriptAddress =
      "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe";
    const argsWithFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerScriptAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Script" in schema.feeManager) {
      expect(schema.feeManager.Script.hex).toBeDefined();
      expect(schema.feeManager.Script.hex).toBe(
        "484969d936f484c45f143d911f81636fe925048e205048ee1fe412aa",
      );
      expect(schema.feeManager.Script.hex.length).toBe(56);
    } else {
      expect().fail("Expected feeManager to be a Script type");
    }
  });

  it("should build the pool mint datum with null feeManager when not provided", () => {
    const { schema } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[0].args,
    );

    expect(schema.feeManager).toBeNull();
  });

  it("should build the pool mint datum with null feeManager when empty string provided", () => {
    const argsWithEmptyFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: "",
    };

    const { schema } = builderInstance.buildMintPoolDatum(
      argsWithEmptyFeeManager,
    );

    expect(schema.feeManager).toBeNull();
  });

  it("should throw an error for invalid feeManager address", () => {
    const invalidAddress = "invalid_address";
    const argsWithInvalidFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: invalidAddress,
    };

    expect(() =>
      builderInstance.buildMintPoolDatum(argsWithInvalidFeeManager),
    ).toThrowError(
      'Failed to extract payment hash from feeManager address: invalid_address. Error: Letter "1" must be present between prefix and data only',
    );
  });

  it("should extract payment hash from valid feeManager address (non-script)", () => {
    const feeManagerAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Address" in schema.feeManager) {
      expect(schema.feeManager.Address.hex).toBeDefined();
      expect(schema.feeManager.Address.hex).toBe(
        "26977346f8c25a12f6101e0a06385abad18d65530d420203a8560b71",
      );
      expect(schema.feeManager.Address.hex.length).toBe(56);
    } else {
      expect().fail("Expected feeManager to be an Address type");
    }
  });

  it("should correctly identify and handle script vs non-script addresses", () => {
    // Test with a non-script address
    const nonScriptAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithNonScriptFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: nonScriptAddress,
    };

    const { schema: schemaNonScript } = builderInstance.buildMintPoolDatum(
      argsWithNonScriptFeeManager,
    );
    expect(schemaNonScript.feeManager).not.toBeNull();
    expect("Address" in schemaNonScript.feeManager!).toBe(true);
    expect("Script" in schemaNonScript.feeManager!).toBe(false);

    // Test with a script address
    const scriptAddress =
      "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0";
    const argsWithScriptFeeManager = {
      ...V3_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: scriptAddress,
    };

    const { schema: schemaScript } = builderInstance.buildMintPoolDatum(
      argsWithScriptFeeManager,
    );
    expect(schemaScript.feeManager).not.toBeNull();
    expect("Script" in schemaScript.feeManager!).toBe(true);
    expect("Address" in schemaScript.feeManager!).toBe(false);
  });
});
