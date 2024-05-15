import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EDatumType,
  QueryProviderSundaeSwap,
} from "@sundaeswap/core";
import { TxBuilderLucidV3 } from "@sundaeswap/core/lucid";
import {
  PREVIEW_DATA,
  params,
  settingsUtxos,
  setupLucid,
} from "@sundaeswap/core/testing";
import { C, Data, Lucid, Tx } from "lucid-cardano";

import { Delegation, TDelegation } from "../../../@types/contracts.js";
import { YieldFarmingLucid } from "../YieldFarming.Lucid.class.js";
import { delegation } from "./data/delegation.js";
import {
  MIGRATION_ASSETS_UTXO,
  NO_MIGRATION_ASSETS_UTXO,
} from "./data/positions.js";

jest
  .spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScriptHashes")
  .mockResolvedValue(params);

jest
  .spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScripts")
  .mockResolvedValue(params);

let YFInstance: YieldFarmingLucid;
let lucidInstance: Lucid;

const { getUtxosByOutRefMock, ownerAddress } = setupLucid((lucid) => {
  YFInstance = new YieldFarmingLucid(lucid);
  lucidInstance = lucid;
});

describe("YieldFarmingLucid", () => {
  it("should build an accurate transaction with an accurate datum when locking a position for the first time.", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
      ])
      .mockResolvedValueOnce(undefined);

    const { datum, build } = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      existingPositions: [],
    });

    const { builtTx } = await build();
    let hasLockedValuesOutput: boolean = false;
    let lockedValueDatum: TDelegation | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const { amount, datum } = builtTx.txComplete
          .body()
          .outputs()
          .get(index)
          .to_js_value();

        if (amount.coin !== "5000000") {
          return;
        }

        if (
          !amount.multiasset[
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5"
          ]
        ) {
          return;
        }

        if (
          amount.multiasset[
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5"
          ]["69555344"] !== "10000000"
        ) {
          return;
        }

        lockedValueDatum =
          datum.Data.original_bytes &&
          Data.from(
            Buffer.from(datum.Data.original_bytes).toString("hex"),
            Delegation
          );
        hasLockedValuesOutput = true;
      }
    );

    expect(hasLockedValuesOutput).toBeTruthy();
    expect(lockedValueDatum).toMatchObject<TDelegation>({
      owner: {
        address: lucidInstance.utils.getAddressDetails(ownerAddress)
          .stakeCredential?.hash as string,
      },
      programs: [],
    });
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff"
    );
  });

  it("should build an accurate datum when updating a position but the delegation is null (i.e. it updates the positions and reuses the existing delegation)", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
      ])
      .mockResolvedValueOnce([
        {
          address:
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
          assets: {
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
              10000000n,
            lovelace: 5000000n,
          },
          outputIndex: 0,
          datum:
            "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
          txHash:
            "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        },
      ]);

    const { datum } = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
        new AssetAmount(372_501_888n, {
          assetId:
            "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702003",
          decimals: 0,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      existingPositions: [
        {
          hash: "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
          index: 0,
        },
      ],
      programs: null,
    });

    /**
     * @TODO Figure out why Lucid yells about max collateral inputs when spending an existing position.
     */
    // await build();
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
    );

    // Cover case where there are no existing positions with null.
    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
    ]);
    const { datum: fallbackDatum } = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
        new AssetAmount(372_501_888n, {
          assetId:
            "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702003",
          decimals: 0,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      existingPositions: [],
      programs: null,
    });

    expect(fallbackDatum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff"
    );
  });

  it("should build an accurate datum when updating a position but the delegation is possibly defined (i.e. it updates the positions and the delegation)", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
      ])
      .mockResolvedValueOnce([
        {
          address:
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
          assets: {
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
              10000000n,
            lovelace: 5000000n,
          },
          outputIndex: 0,
          datum:
            "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
          txHash:
            "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        },
      ]);

    const { datum } = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
        new AssetAmount(372_501_888n, {
          assetId:
            "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702003",
          decimals: 0,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      existingPositions: [
        {
          hash: "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
          index: 0,
        },
      ],
    });

    /**
     * @TODO Figure out why Lucid yells about max collateral inputs when spending an existing position.
     */
    // await build();
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff"
    );
  });

  it("should build a delegation datum along with the transaction if set", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
      ])
      .mockResolvedValueOnce(undefined);

    const { build, datum } = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
        // Should accumulate this duplicate value to 20
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      programs: delegation,
      existingPositions: [],
    });

    const { builtTx } = await build();
    let hasLockedValuesOutput: boolean = false;
    let lockedValueDatum: TDelegation | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const { amount, datum } = builtTx.txComplete
          .body()
          .outputs()
          .get(index)
          .to_js_value();

        if (amount.coin !== "5000000") {
          return;
        }

        if (
          !amount.multiasset[
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5"
          ]
        ) {
          return;
        }

        if (
          amount.multiasset[
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5"
          ]["69555344"] !== "20000000"
        ) {
          return;
        }

        lockedValueDatum =
          datum.Data.original_bytes &&
          Data.from(
            Buffer.from(datum.Data.original_bytes).toString("hex"),
            Delegation
          );
        hasLockedValuesOutput = true;
      }
    );

    expect(hasLockedValuesOutput).toBeTruthy();
    expect(lockedValueDatum).toMatchObject<TDelegation>({
      owner: {
        address: lucidInstance.utils.getAddressDetails(ownerAddress)
          .stakeCredential?.hash as string,
      },
      programs: delegation,
    });
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
    );
  });

  it("should build an accurate datum when updating a delegation but the lockedValues is null (i.e. it updates the delegations and reuses the existing positions)", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
      ])
      .mockResolvedValueOnce([
        {
          address:
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
          assets: {
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
              10000000n,
            lovelace: 5000000n,
          },
          outputIndex: 0,
          datum:
            "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87980ffff",
          txHash:
            "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        },
      ]);

    const spiedPayToContract = jest.spyOn(Tx.prototype, "payToContract");
    const { datum } = await YFInstance.lock({
      lockedValues: null,
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      existingPositions: [
        {
          hash: "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
          index: 0,
        },
      ],
      programs: delegation,
    });

    expect(spiedPayToContract).toHaveBeenNthCalledWith(
      1,
      "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
      {
        inline:
          "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
      },

      {
        "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
          10000000n,
        lovelace: 5000000n,
      }
    );
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
    );
  });

  it("should not build a datum when unlocking assets", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
      ])
      .mockResolvedValueOnce([
        {
          address:
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
          assets: {
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
              10000000n,
            lovelace: 5000000n,
          },
          outputIndex: 0,
          datum:
            "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffd87980ff",
          txHash:
            "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        },
      ]);

    const { datum, fees } = await YFInstance.unlock({
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      programs: delegation,
      existingPositions: [
        {
          hash: "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
          index: 0,
        },
      ],
    });

    expect(datum).toBeUndefined();
    expect(fees.deposit.amount).toEqual(0n);
  });

  it("should throw an error if the reference input cannot be found", async () => {
    getUtxosByOutRefMock.mockResolvedValueOnce(undefined);

    expect(() =>
      YFInstance.lock({
        lockedValues: [
          new AssetAmount(5_000_000n, ADA_METADATA),
          new AssetAmount(10_000_000n, {
            assetId:
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
            decimals: 6,
          }),
        ],
        ownerAddress: {
          address: ownerAddress,
          datum: {
            type: EDatumType.NONE,
          },
        },
        programs: delegation,
        existingPositions: [],
      })
    ).rejects.toThrowError(
      "Could not fetch valid UTXO from Blockfrost based on the the Yield Farming reference input."
    );
  });

  it("should correctly build the fees object", async () => {
    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
    ]);

    const { fees, build } = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      programs: delegation,
      existingPositions: [],
    });

    expect(fees).toMatchObject({
      cardanoTxFee: expect.objectContaining({
        amount: 0n,
        metadata: ADA_METADATA,
      }),
      deposit: expect.objectContaining({
        amount: 5_000_000n,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 0n,
        metadata: ADA_METADATA,
      }),
    });

    await build();
    expect(fees.cardanoTxFee?.amount).toBeGreaterThan(0n);
  });

  it("should correctly add the referral fee", async () => {
    const referralFeeAddress =
      "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68";
    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
    ]);

    const adaReferral = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      programs: delegation,
      existingPositions: [],
      referralFee: {
        destination: referralFeeAddress,
        payment: new AssetAmount(1_000_000n, ADA_METADATA),
        feeLabel: "Test Label",
      },
    });

    expect(adaReferral.fees.referral).toMatchObject({
      amount: 1_000_000n,
      metadata: ADA_METADATA,
    });

    const { builtTx: adaReferralBuiltTx } = await adaReferral.build();
    let hasAdaReferralFee: boolean = false;
    [
      ...Array(adaReferralBuiltTx.txComplete.body().outputs().len()).keys(),
    ].forEach((index) => {
      const { amount, address } = adaReferralBuiltTx.txComplete
        .body()
        .outputs()
        .get(index)
        .to_js_value();

      if (amount.coin !== "1000000") {
        return;
      }

      if (amount.multiasset) {
        return;
      }

      if (address !== referralFeeAddress) {
        return;
      }

      hasAdaReferralFee = true;
    });

    expect(hasAdaReferralFee).toBeTruthy();

    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest,
    ]);

    const nonAdaReferral = await YFInstance.lock({
      lockedValues: [
        new AssetAmount(5_000_000n, ADA_METADATA),
        new AssetAmount(10_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          decimals: 6,
        }),
      ],
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      programs: delegation,
      existingPositions: [],
      referralFee: {
        destination: referralFeeAddress,
        payment: new AssetAmount(1_000_000n, {
          decimals: 6,
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
        }),
        feeLabel: "Non-Ada Test Label",
      },
    });

    const { builtTx: nonAdaReferralBuiltTx } = await nonAdaReferral.build();
    let hasNonAdaReferralFee: boolean = false;
    [
      ...Array(nonAdaReferralBuiltTx.txComplete.body().outputs().len()).keys(),
    ].forEach((index) => {
      const { amount, address } = nonAdaReferralBuiltTx.txComplete
        .body()
        .outputs()
        .get(index)
        .to_js_value();

      // min-utxo
      if (amount.coin !== "1155080") {
        return;
      }

      if (
        !amount.multiasset?.[
          "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5"
        ]
      ) {
        return;
      }

      if (
        amount.multiasset?.[
          "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5"
        ]["69555344"] !== "1000000"
      ) {
        return;
      }

      if (address !== referralFeeAddress) {
        return;
      }

      hasNonAdaReferralFee = true;
    });

    expect(hasNonAdaReferralFee).toBeTruthy();

    // Test Labels
    expect(
      adaReferralBuiltTx.txComplete
        .auxiliary_data()
        ?.metadata()
        ?.get(C.BigNum.from_str("674"))
        ?.as_text()
    ).toEqual("Test Label: 1 ADA");
    expect(
      nonAdaReferralBuiltTx.txComplete
        .auxiliary_data()
        ?.metadata()
        ?.get(C.BigNum.from_str("674"))
        ?.as_text()
    ).toEqual("Non-Ada Test Label: 1 iUSD");
  });

  it("should do a v1 to v3 migration properly", async () => {
    try {
      await YFInstance.migrateToV3({
        ownerAddress: {
          address: ownerAddress,
          datum: {
            type: EDatumType.NONE,
          },
        },
        migrations: [
          {
            depositPool: PREVIEW_DATA.pools.v3,
            withdrawPool: PREVIEW_DATA.pools.v1,
          },
        ],
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        "There must be a list of existing positions to migrate!"
      );
    }

    getUtxosByOutRefMock.mockResolvedValueOnce([NO_MIGRATION_ASSETS_UTXO]);
    try {
      await YFInstance.migrateToV3({
        ownerAddress: {
          address: ownerAddress,
          datum: {
            type: EDatumType.NONE,
          },
        },
        migrations: [
          {
            depositPool: PREVIEW_DATA.pools.v3,
            withdrawPool: PREVIEW_DATA.pools.v1,
          },
        ],
        existingPositions: [
          {
            hash: "f28d6c3105a8a72f83e2cff9c9c042eb8e0449a6b5ab38b26ff899ab61be997e",
            index: 0,
          },
        ],
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        "There were no eligible assets to migrate within the provided existing positions. Please check your migration config, and try again."
      );
    }

    getUtxosByOutRefMock.mockResolvedValueOnce([MIGRATION_ASSETS_UTXO]);
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllSettingsUtxos")
      .mockResolvedValue(settingsUtxos);

    await YFInstance.migrateToV3({
      ownerAddress: {
        address: ownerAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
      migrations: [
        {
          depositPool: PREVIEW_DATA.pools.v3,
          withdrawPool: PREVIEW_DATA.pools.v1,
        },
      ],
      existingPositions: [
        {
          hash: "f28d6c3105a8a72f83e2cff9c9c042eb8e0449a6b5ab38b26ff899ab61be997e",
          index: 0,
        },
      ],
    });
  });
});
