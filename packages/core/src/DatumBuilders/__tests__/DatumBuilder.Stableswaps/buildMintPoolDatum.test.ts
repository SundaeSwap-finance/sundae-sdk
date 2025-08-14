import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";
import { STABLESWAP_EXPECTATIONS } from "../../__data__/stableswaps.expectations.js";
import {
  DatumBuilderStableswaps,
  IDatumBuilderMintStablePoolArgs,
} from "../../DatumBuilder.Stableswaps.class.js";
import { DatumBuilderV3 } from "../../DatumBuilder.V3.class.js";

let builderInstance: DatumBuilderStableswaps;

beforeEach(() => {
  builderInstance = new DatumBuilderStableswaps("preview");
});

afterEach(() => {
  mock.restore();
});

describe("builderMintPoolDatum()", () => {
  it("should build the pool mint datum properly", () => {
    const spiedOnComputePoolId = spyOn(DatumBuilderV3, "computePoolId");
    const spiedOnBuildLexicographicalAssetsDatum = spyOn(
      DatumBuilderStableswaps.prototype,
      "buildLexicographicalAssetsDatum",
    );

    const { inline, hash, schema } = builderInstance.buildMintPoolDatum(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
    );

    expect(schema.sumInvariant).toEqual(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].expectations.sumInvariant,
    );

    expect(spiedOnComputePoolId).toHaveBeenNthCalledWith(
      ...(STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .calledWith as [number, IDatumBuilderMintStablePoolArgs["seedUtxo"]]),
    );
    expect(spiedOnComputePoolId).toHaveReturnedTimes(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .returnedWith[0] as number,
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .buildLexicographicalAssetsDatumCalls,
    );
    expect(inline).toEqual(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].expectations.inline,
    );
    expect(hash).toEqual(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].expectations.hash,
    );
  });

  it("should build the pool mint datum with feeManager address (non-script)", () => {
    const feeManagerAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerAddress,
    };

    const { schema, inline } =
      builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Signature" in schema.feeManager) {
      expect(schema.feeManager.Signature).toHaveProperty("keyHash");
      expect(typeof schema.feeManager.Signature.keyHash).toBe("string");
      expect(schema.feeManager.Signature.keyHash.length).toBeGreaterThan(0);
    } else {
      expect().fail("Expected feeManager to be an Signature type");
    }
  });

  it("should build the pool mint datum with linearAmplificationManager address (non-script)", () => {
    const linearAmplificationManagerAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithLAManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      linearAmplificationManager: linearAmplificationManagerAddress,
    };

    const { schema, inline } =
      builderInstance.buildMintPoolDatum(argsWithLAManager);

    expect(schema.linearAmplificationManager).not.toBeNull();
    console.log("Inline:", inline);
    if (
      schema.linearAmplificationManager &&
      "Signature" in schema.linearAmplificationManager
    ) {
      expect(schema.linearAmplificationManager.Signature).toHaveProperty(
        "keyHash",
      );
      expect(typeof schema.linearAmplificationManager.Signature.keyHash).toBe(
        "string",
      );
      expect(
        schema.linearAmplificationManager.Signature.keyHash.length,
      ).toBeGreaterThan(0);
    } else {
      expect().fail("Expected feeManager to be an Signature type");
    }
  });

  it("should build the pool mint datum with feeManager script address", () => {
    const feeManagerScriptAddress =
      "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0";
    const argsWithFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerScriptAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Script" in schema.feeManager) {
      expect(schema.feeManager.Script).toHaveProperty("scriptHash");
      expect(typeof schema.feeManager.Script.scriptHash).toBe("string");
      expect(schema.feeManager.Script.scriptHash.length).toBeGreaterThan(0);
    } else {
      expect().fail("Expected feeManager to be a Script type");
    }
  });

  it("should build the pool mint datum with another script address", () => {
    const feeManagerScriptAddress =
      "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe";
    const argsWithFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerScriptAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Script" in schema.feeManager) {
      expect(schema.feeManager.Script.scriptHash).toBeDefined();
      expect(schema.feeManager.Script.scriptHash).toBe(
        "484969d936f484c45f143d911f81636fe925048e205048ee1fe412aa",
      );
      expect(schema.feeManager.Script.scriptHash.length).toBe(56);
    } else {
      expect().fail("Expected feeManager to be a Script type");
    }
  });

  it("should build the pool mint datum with undefined feeManager when not provided", () => {
    const { schema } = builderInstance.buildMintPoolDatum(
      STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
    );

    expect(schema.feeManager).toBeUndefined();
  });

  it("should build the pool mint datum with undefined feeManager when empty string provided", () => {
    const argsWithEmptyFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: "",
    };

    const { schema } = builderInstance.buildMintPoolDatum(
      argsWithEmptyFeeManager,
    );

    expect(schema.feeManager).toBeUndefined();
  });

  it("should throw an error for invalid feeManager address", () => {
    const invalidAddress = "invalid_address";
    const argsWithInvalidFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: invalidAddress,
    };

    expect(() =>
      builderInstance.buildMintPoolDatum(argsWithInvalidFeeManager),
    ).toThrowError(
      'Failed to extract payment hash from address: invalid_address. Error: Letter "1" must be present between prefix and data only',
    );
  });

  it("should extract payment hash from valid feeManager address (non-script)", () => {
    const feeManagerAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: feeManagerAddress,
    };

    const { schema } = builderInstance.buildMintPoolDatum(argsWithFeeManager);

    expect(schema.feeManager).not.toBeNull();
    if (schema.feeManager && "Signature" in schema.feeManager) {
      expect(schema.feeManager.Signature.keyHash).toBeDefined();
      expect(schema.feeManager.Signature.keyHash).toBe(
        "26977346f8c25a12f6101e0a06385abad18d65530d420203a8560b71",
      );
      expect(schema.feeManager.Signature.keyHash.length).toBe(56);
    } else {
      expect().fail("Expected feeManager to be an Address type");
    }
  });

  it("should correctly identify and handle script vs non-script addresses", () => {
    // Test with a non-script address
    const nonScriptAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    const argsWithNonScriptFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: nonScriptAddress,
    };

    const { schema: schemaNonScript } = builderInstance.buildMintPoolDatum(
      argsWithNonScriptFeeManager,
    );
    expect(schemaNonScript.feeManager).not.toBeNull();
    expect("Signature" in schemaNonScript.feeManager!).toBe(true);
    expect("Script" in schemaNonScript.feeManager!).toBe(false);

    // Test with a script address
    const scriptAddress =
      "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0";
    const argsWithScriptFeeManager = {
      ...STABLESWAP_EXPECTATIONS.buildMintPoolDatum[0].args,
      feeManager: scriptAddress,
    };

    const { schema: schemaScript } = builderInstance.buildMintPoolDatum(
      argsWithScriptFeeManager,
    );
    expect(schemaScript.feeManager).not.toBeNull();
    expect("Script" in schemaScript.feeManager!).toBe(true);
    expect("Signature" in schemaScript.feeManager!).toBe(false);
  });
});
