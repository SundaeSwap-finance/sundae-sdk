import { Core, makeValue } from "@blaze-cardano/sdk";
import { afterAll, describe, expect, it, mock, spyOn } from "bun:test";

import { serialize, Void } from "@blaze-cardano/data";
import { EmulatorProvider } from "@blaze-cardano/emulator";
import { StableswapsTypes } from "../../DatumBuilders/ContractTypes/index.js";
import { DatumBuilderV3 } from "../../DatumBuilders/DatumBuilder.V3.class.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { setupBlaze } from "../../TestUtilities/setupBlaze.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { TxBuilderStableswaps } from "../TxBuilder.Stableswaps.class.js";
import {
  params,
  referenceUtxosBlaze,
  settingsUtxosBlaze,
} from "../__data__/mockData.V3.js";

spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolParamsWithScriptHashes",
).mockResolvedValue(params);

spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolParamsWithScripts",
).mockResolvedValue(params);

spyOn(TxBuilderStableswaps.prototype, "getSettingsUtxo").mockResolvedValue(
  settingsUtxosBlaze[0],
);

spyOn(TxBuilderStableswaps.prototype, "getAllReferenceUtxos").mockResolvedValue(
  referenceUtxosBlaze,
);

let builder: TxBuilderStableswaps;

const { getUtxosByOutRefMock } = setupBlaze(async (blaze) => {
  builder = new TxBuilderStableswaps(blaze);
});

afterAll(() => {
  mock.restore();
});

describe("TxBuilderStableswaps", () => {
  describe("updateProtocolFees", () => {
    it("should throw error when bid fee exceeds max basis points", async () => {
      try {
        await builder.updateProtocolFees({
          poolUtxo: {
            hash: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            index: 0,
          },
          protocolFees: { bid: 10001n, ask: 100n },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (e) {
        expect((e as Error).message).toContain(
          "Protocol fees must be between 0 and 10000 basis points",
        );
      }
    });

    it("should throw error when ask fee exceeds max basis points", async () => {
      try {
        await builder.updateProtocolFees({
          poolUtxo: {
            hash: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            index: 0,
          },
          protocolFees: { bid: 100n, ask: 10001n },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (e) {
        expect((e as Error).message).toContain(
          "Protocol fees must be between 0 and 10000 basis points",
        );
      }
    });

    it("should throw error when bid fee is negative", async () => {
      try {
        await builder.updateProtocolFees({
          poolUtxo: {
            hash: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            index: 0,
          },
          protocolFees: { bid: -1n, ask: 100n },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (e) {
        expect((e as Error).message).toContain(
          "Protocol fees must be between 0 and 10000 basis points",
        );
      }
    });

    it("should throw error when ask fee is negative", async () => {
      try {
        await builder.updateProtocolFees({
          poolUtxo: {
            hash: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            index: 0,
          },
          protocolFees: { bid: 100n, ask: -1n },
        });
        expect(true).toBe(false); // Should not reach here
      } catch (e) {
        expect((e as Error).message).toContain(
          "Protocol fees must be between 0 and 10000 basis points",
        );
      }
    });

    // Note: This test verifies the composed transaction structure without calling build().
    // Fully building the transaction would require mocking all reference script UTXOs
    // with valid compiled scripts, which is complex. The validation tests above cover
    // the input validation, and this test ensures the method executes and returns
    // the expected IComposedTx structure.
    it("should return composed transaction with expected structure", async () => {
      const poolScriptHash = params.blueprint.validators.find(
        (v) => v.title === "pool.spend",
      )!.hash;

      // Create a script address for the pool (required for spending with a redeemer)
      const poolScriptAddress = Core.addressFromCredentials(
        Core.NetworkId.Testnet,
        Core.Credential.fromCore({
          hash: Core.Hash28ByteBase16(poolScriptHash),
          type: Core.CredentialType.ScriptHash,
        }),
      );

      // Create a mock stable pool datum
      const mockPoolDatum: StableswapsTypes.StablePoolDatum = {
        identifier: "00",
        assets: [
          ["", ""],
          [
            "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183",
            "74494e4459",
          ],
        ],
        circulatingLp: 1000000n,
        lpFeeBasisPoints: [30n, 30n],
        protocolFeeBasisPoints: [100n, 100n],
        feeManager: {
          Signature: {
            keyHash:
              "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
          },
        },
        marketOpen: 0n,
        protocolFees: [0n, 0n, 0n],
        linearAmplification: 100n,
        sumInvariant: 2000000n,
        linearAmplificationManager: {
          Signature: {
            keyHash:
              "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
          },
        },
      };

      const poolDatumCbor = serialize(
        StableswapsTypes.StablePoolDatum,
        mockPoolDatum,
      );

      // Create mock pool UTXO at a script address (required for spending with a redeemer)
      const poolBech32Address = poolScriptAddress.toBech32();
      const mockPoolUtxo = Core.TransactionUnspentOutput.fromCore([
        new Core.TransactionInput(
          Core.TransactionId(
            "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          ),
          0n,
        ).toCore(),
        Core.TransactionOutput.fromCore({
          address: Core.PaymentAddress(poolBech32Address),
          value: makeValue(
            10_000_000n,
            [
              "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
              1000000n,
            ],
          ).toCore(),
          datum: poolDatumCbor.toCore(),
        }).toCore(),
      ]);

      // Create mock wallet UTXOs (need multiple for input + collateral)
      const mockWalletUtxos = [
        Core.TransactionUnspentOutput.fromCore([
          new Core.TransactionInput(
            Core.TransactionId(
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            ),
            0n,
          ).toCore(),
          Core.TransactionOutput.fromCore({
            address: Core.PaymentAddress(PREVIEW_DATA.addresses.current),
            value: makeValue(10_000_000n).toCore(),
          }).toCore(),
        ]),
        Core.TransactionUnspentOutput.fromCore([
          new Core.TransactionInput(
            Core.TransactionId(
              "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            ),
            0n,
          ).toCore(),
          Core.TransactionOutput.fromCore({
            address: Core.PaymentAddress(PREVIEW_DATA.addresses.current),
            value: makeValue(10_000_000n).toCore(),
          }).toCore(),
        ]),
      ];

      // Mock the provider methods
      const resolveUnspentOutputsMock = spyOn(
        EmulatorProvider.prototype,
        "resolveUnspentOutputs",
      ).mockResolvedValue([mockPoolUtxo]);

      const getUnspentOutputsMock = spyOn(
        EmulatorProvider.prototype,
        "getUnspentOutputs",
      ).mockResolvedValue(mockWalletUtxos);

      const getSettingsUtxoDatumMock = spyOn(
        TxBuilderStableswaps.prototype,
        "getSettingsUtxoDatum",
      ).mockResolvedValue(
        settingsUtxosBlaze[0].output().datum()?.asInlineData()?.toCbor() as string,
      );

      // Mock getTreasuryAddress to return a script address (required by lockLovelace)
      const treasuryScriptAddress = Core.addressFromCredentials(
        Core.NetworkId.Testnet,
        Core.Credential.fromCore({
          hash: Core.Hash28ByteBase16(poolScriptHash),
          type: Core.CredentialType.ScriptHash,
        }),
      ).toBech32();
      const getTreasuryAddressMock = spyOn(
        DatumBuilderV3,
        "getTreasuryAddress",
      ).mockReturnValue(treasuryScriptAddress);

      try {
        const result = await builder.updateProtocolFees({
          poolUtxo: {
            hash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            index: 0,
          },
          protocolFees: { bid: 50n, ask: 50n },
        });

        // Verify the composed transaction structure
        expect(result).toBeDefined();
        expect(result.fees).toBeDefined();
        expect(result.build).toBeDefined();
        expect(typeof result.build).toBe("function");

        // Verify fee structure
        expect(result.fees.deposit).toBeDefined();
        expect(result.fees.scooperFee).toBeDefined();
      } finally {
        resolveUnspentOutputsMock.mockRestore();
        getUnspentOutputsMock.mockRestore();
        getSettingsUtxoDatumMock.mockRestore();
        getTreasuryAddressMock.mockRestore();
      }
    });
  });
});
