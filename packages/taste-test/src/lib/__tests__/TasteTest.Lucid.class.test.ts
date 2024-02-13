import { setupLucid } from "@sundaeswap/core/testing";
import { Lucid } from "lucid-cardano";

import { IBaseArgs } from "../../@types/index.js";
import { TasteTestLucid } from "../classes/TasteTest.Lucid.class.js";

let TT: TasteTestLucid;

const { getUtxosByOutRefMock } = setupLucid((lucid) => {
  TT = new TasteTestLucid(lucid);
});

describe("TasteTestLucid", () => {
  it("should initialize with the right config", () => {
    expect(TT.lucid).toBeInstanceOf(Lucid);
  });

  test("nodePolicyFromArgs", async () => {
    const scriptArgs: IBaseArgs = {
      scripts: {
        policy: {
          script: "test-script-policy",
          type: "PlutusV2",
        },
        validator: {
          script: "test-script-validator",
          type: "PlutusV2",
        },
      },
    };

    const { script, type } = await TT.getNodePolicyFromArgs(scriptArgs);
    expect(script).toEqual("test-script-policy");
    expect(type).toEqual("PlutusV2");

    const txArgs: IBaseArgs = {
      scripts: {
        policy: {
          txHash: "test-hash-policy",
          outputIndex: 0,
        },
        validator: {
          txHash: "test-hash-validator",
          outputIndex: 0,
        },
      },
    };

    getUtxosByOutRefMock.mockResolvedValueOnce([
      {
        address: "test-address",
        assets: { lovelace: 100n },
        outputIndex: 0,
        txHash: "test-hash",
      },
    ]);

    expect(TT.getNodePolicyFromArgs(txArgs)).rejects.toThrowError(
      "Could not derive UTXO from supplied OutRef in scripts.policy."
    );
  });
});
