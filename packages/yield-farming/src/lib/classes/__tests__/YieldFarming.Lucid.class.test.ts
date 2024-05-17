import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EDatumType,
  QueryProviderSundaeSwap,
} from "@sundaeswap/core";
import {
  PREVIEW_DATA,
  params,
  settingsUtxos,
  setupLucid,
} from "@sundaeswap/core/testing";
import { C, Data, Lucid, Tx } from "lucid-cardano";

import { TxBuilderLucidV3 } from "@sundaeswap/core/lucid";
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
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
      PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
      PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
      PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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
      PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
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

    getUtxosByOutRefMock
      .mockResolvedValueOnce([MIGRATION_ASSETS_UTXO])
      .mockResolvedValueOnce([
        PREVIEW_DATA.wallet.referenceUtxos.previewYFReferenceInput,
      ]);

    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllSettingsUtxos")
      .mockResolvedValue(settingsUtxos);

    const { build } = await YFInstance.migrateToV3({
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

    const { cbor } = await build();
    expect(cbor).toEqual(
      "84aa0082825820f28d6c3105a8a72f83e2cff9c9c042eb8e0449a6b5ab38b26ff899ab61be997e00825820fda5c685eaff5fbb2a7ecb250389fd24a7216128929a9da0ad95b72b586fab7001018383581d70730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e821a004c4b40a1581c4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9a1446c7020061b000000746a5288005820bc4bc185aca53199a608b4cf3f8b312dc926e368595860934c97b8d4fbf87641a30058391073275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa801821a004c4b40a1581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15a144555344431a02625a00028201d818585fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff82583900c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01b00000003be6703b9021a0003a2380758205c93f5c5a808b1a60e8008b61678b7c71b0e850919403e43feed6bda6107926c0b5820ee58c2a0c90d28faafb874b2351e38cae733fad8716e60814be03bf10597ab970d81825820fda5c685eaff5fbb2a7ecb250389fd24a7216128929a9da0ad95b72b586fab70010e82581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01082583900c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01b00000003beb17ddd111a000573541281825820aaaf193b8418253f4169ab869b77dedd4ee3df4f2837c226cee3c2f7fa95518900a2049fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffffd8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f5820ab8220760a832276e4a79cbb2730de62c5c1f17680790911a244b4d4cc9cc069ffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1b000000746a528800ffffff0581840000d87a80821a000171ab1a020fc154f5a11a00019353a2582029d4b994f2d4b29e34701e1dbc3e6e519684eaa808ff3944a6d646a74d86fcc484581fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b4069581f1eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e44594104581f1837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ff42ffff5820ab8220760a832276e4a79cbb2730de62c5c1f17680790911a244b4d4cc9cc06989581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c045d47cac5067ce697478c11051deb935a152e07581f73a5d7430a11baa8ff1a0007a120d8799fd8799fd87a9f581c73275b9e267f581fd927bfc14cf653d904d1538ad8869260ab638bf73f5cffd8799fd8799fd879581f9f581c045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8581fffffffffd87a9f582029d4b994f2d4b29e34701e1dbc3e6e519684eaa808ff581f3944a6d646a74d86fcc4ffffd87b9f9f9f40401b000000a4a2d93ca5ff9f58581f1cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183457455494e44591b00000052516c9e52ffffff43d87980ff"
    );
  });
});
