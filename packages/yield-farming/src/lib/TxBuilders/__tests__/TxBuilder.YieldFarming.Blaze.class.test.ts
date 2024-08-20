import { Core, Data, makeValue, TxBuilder } from "@blaze-cardano/sdk";
import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import { ADA_METADATA } from "@sundaeswap/core";
import { setupBlaze } from "@sundaeswap/core/blaze";
import { PREVIEW_DATA } from "@sundaeswap/core/testing";

import { Delegation, TDelegation } from "../../../@types/blaze.js";
import { delegation } from "../../__data__/delegationData.js";
import { YieldFarmingBlaze } from "../TxBuilder.YieldFarming.Blaze.class.js";
// import { delegation } from "../__data__/yieldfarming.expectations.js";

let YFInstance: YieldFarmingBlaze;

const { getUtxosByOutRefMock, ownerAddress } = setupBlaze((Blaze) => {
  YFInstance = new YieldFarmingBlaze(Blaze, 0);
});

afterEach(() => {
  getUtxosByOutRefMock.mockReset();
});

describe("YieldFarmingBlaze", () => {
  it("should build an accurate transaction with an accurate datum when locking a position for the first time.", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        new Core.TransactionOutput(
          Core.Address.fromBech32(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
          ),
          makeValue(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
            ).filter(([key]) => key !== "lovelace")
          )
        ),
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
      ownerAddress: ownerAddress,
      existingPositions: [],
    });

    const { builtTx } = await build();
    let hasLockedValuesOutput: boolean = false;
    let lockedValueDatum: TDelegation | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx
        .body()
        .outputs()
        .find((_, outputIndex) => outputIndex === index);

      if (output && output.amount().coin() !== 5000000n) {
        return;
      }

      const asset =
        output &&
        output
          .amount()
          .multiasset()
          ?.get(
            Core.AssetId(
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344"
            )
          );

      if (!asset) {
        return;
      }

      if (asset !== 10000000n) {
        return;
      }

      lockedValueDatum = datum
        ? Data.from(Core.PlutusData.fromCbor(Core.HexBlob(datum)), Delegation)
        : undefined;
      hasLockedValuesOutput = true;
    });

    expect(hasLockedValuesOutput).toBeTruthy();
    expect(lockedValueDatum).toMatchObject<TDelegation>({
      owner: {
        address: Core.addressFromBech32(ownerAddress)
          .asBase()
          ?.getStakeCredential().hash as string,
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
        new Core.TransactionOutput(
          Core.Address.fromBech32(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
          ),
          makeValue(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
            ).filter(([key]) => key !== "lovelace")
          )
        ),
      ])
      .mockResolvedValueOnce([
        Core.TransactionOutput.fromCore({
          address: Core.PaymentAddress(
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg"
          ),
          value: makeValue(
            5000000n,
            ...Object.entries({
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
                10000000n,
            })
          ).toCore(),
          datum: Core.PlutusData.fromCbor(
            Core.HexBlob(
              "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
            )
          ).toCore(),
        }),
        // {
        //   address:
        //     "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
        //   assets: {
        //     "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
        //       10000000n,
        //     lovelace: 5000000n,
        //   },
        //   outputIndex: 0,
        //   datum:
        //     "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
        //   txHash:
        //     "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        // },
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
      ownerAddress: ownerAddress,
      existingPositions: [
        {
          hash: "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
          index: 0,
        },
      ],
      programs: null,
    });

    /**
     * @TODO Figure out why Blaze yells about max collateral inputs when spending an existing position.
     */
    // await build();
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
    );

    // Cover case where there are no existing positions with null.
    getUtxosByOutRefMock.mockResolvedValueOnce([
      new Core.TransactionOutput(
        Core.Address.fromBech32(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
        ),
        makeValue(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
          ...Object.entries(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
          ).filter(([key]) => key !== "lovelace")
        )
      ),
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
      ownerAddress: ownerAddress,
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
        new Core.TransactionOutput(
          Core.Address.fromBech32(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
          ),
          makeValue(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
            ).filter(([key]) => key !== "lovelace")
          )
        ),
      ])
      .mockResolvedValueOnce([
        Core.TransactionOutput.fromCore({
          address: Core.PaymentAddress(
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg"
          ),
          value: makeValue(
            5_000_000n,
            ...Object.entries({
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
                10000000n,
            })
          ).toCore(),
          datum: Core.PlutusData.fromCbor(
            Core.HexBlob(
              "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff"
            )
          ).toCore(),
        }),
        // {
        //   address:
        //     "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
        //   assets: {
        //     "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
        //       10000000n,
        //     lovelace: 5000000n,
        //   },
        //   outputIndex: 0,
        //   datum:
        //     "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
        //   txHash:
        //     "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        // },
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
      ownerAddress: ownerAddress,
      existingPositions: [
        {
          hash: "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
          index: 0,
        },
      ],
    });

    /**
     * @TODO Figure out why Blaze yells about max collateral inputs when spending an existing position.
     */
    // await build();
    expect(datum).toEqual(
      "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff"
    );
  });

  it("should build a delegation datum along with the transaction if set", async () => {
    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        new Core.TransactionOutput(
          Core.Address.fromBech32(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
          ),
          makeValue(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
            ).filter(([key]) => key !== "lovelace")
          )
        ),
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
      ownerAddress: ownerAddress,
      programs: delegation,
      existingPositions: [],
    });

    const { builtTx } = await build();
    let hasLockedValuesOutput: boolean = false;
    let lockedValueDatum: TDelegation | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx
        .body()
        .outputs()
        .find((_, outputIndex) => outputIndex === index);

      if (output && output.amount().coin() !== 5000000n) {
        return;
      }

      const asset = output
        ?.amount()
        .multiasset()
        ?.get(
          Core.AssetId(
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344"
          )
        );

      if (!asset || asset !== 20000000n) {
        return;
      }

      lockedValueDatum = datum
        ? Data.from(Core.PlutusData.fromCbor(Core.HexBlob(datum)), Delegation)
        : undefined;
      hasLockedValuesOutput = true;
    });

    expect(hasLockedValuesOutput).toBeTruthy();
    expect(lockedValueDatum).toMatchObject<TDelegation>({
      owner: {
        address: Core.addressFromBech32(ownerAddress)
          .asBase()
          ?.getStakeCredential().hash as string,
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
        new Core.TransactionOutput(
          Core.Address.fromBech32(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
          ),
          makeValue(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
            ).filter(([key]) => key !== "lovelace")
          )
        ),
      ])
      .mockResolvedValueOnce([
        Core.TransactionOutput.fromCore({
          address: Core.PaymentAddress(
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg"
          ),
          value: makeValue(
            5_000_000n,
            ...Object.entries({
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
                10000000n,
            })
          ).toCore(),
          datum: Core.PlutusData.fromCbor(
            Core.HexBlob(
              "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87980ffff"
            )
          ).toCore(),
        }),
        // {
        //   address:
        //     "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
        //   assets: {
        //     "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
        //       10000000n,
        //     lovelace: 5000000n,
        //   },
        //   outputIndex: 0,
        //   datum:
        //     "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87980ffff",
        //   txHash:
        //     "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        // },
      ]);

    const spiedPayToContract = jest.spyOn(TxBuilder.prototype, "lockAssets");
    const { datum } = await YFInstance.lock({
      lockedValues: null,
      ownerAddress: ownerAddress,
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
        new Core.TransactionOutput(
          Core.Address.fromBech32(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
          ),
          makeValue(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
            ).filter(([key]) => key !== "lovelace")
          )
        ),
      ])
      .mockResolvedValueOnce([
        Core.TransactionOutput.fromCore({
          address: Core.PaymentAddress(
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg"
          ),
          value: makeValue(
            5_000_000n,
            ...Object.entries({
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
                10000000n,
            })
          ).toCore(),
          datum: Core.PlutusData.fromCbor(
            Core.HexBlob(
              "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffd87980ff"
            )
          ).toCore(),
        }),
        // {
        //   address:
        //     "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
        //   assets: {
        //     "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344":
        //       10000000n,
        //     lovelace: 5000000n,
        //   },
        //   outputIndex: 0,
        //   datum:
        //     "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffd87980ff",
        //   txHash:
        //     "e9d184d82201d9fba441eb88107097bc8e764af3715ab9e95164e3dbd08721de",
        // },
      ]);

    const { datum, fees } = await YFInstance.unlock({
      ownerAddress: ownerAddress,
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
        ownerAddress: ownerAddress,
        programs: delegation,
        existingPositions: [],
      })
    ).rejects.toThrowError(
      "Could not fetch valid UTXO from Blockfrost based on the the Yield Farming reference input."
    );
  });

  it("should correctly build the fees object", async () => {
    getUtxosByOutRefMock.mockResolvedValueOnce([
      new Core.TransactionOutput(
        Core.Address.fromBech32(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
        ),
        makeValue(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
          ...Object.entries(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
          ).filter(([key]) => key !== "lovelace")
        )
      ),
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
      ownerAddress: ownerAddress,
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
      new Core.TransactionOutput(
        Core.Address.fromBech32(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
        ),
        makeValue(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
          ...Object.entries(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
          ).filter(([key]) => key !== "lovelace")
        )
      ),
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
      ownerAddress: ownerAddress,
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
    [...Array(adaReferralBuiltTx.body().outputs().length).keys()].forEach(
      (index) => {
        const output = adaReferralBuiltTx
          .body()
          .outputs()
          .find((_, outputIndex) => outputIndex === index);

        if (!output || output.amount().coin() !== 1000000n) {
          return;
        }

        if (output.amount().multiasset()?.size === 0) {
          return;
        }

        if (output.address().toBech32() !== referralFeeAddress) {
          return;
        }

        hasAdaReferralFee = true;
      }
    );

    expect(hasAdaReferralFee).toBeTruthy();

    getUtxosByOutRefMock.mockResolvedValueOnce([
      new Core.TransactionOutput(
        Core.Address.fromBech32(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.address
        ),
        makeValue(
          PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets.lovelace,
          ...Object.entries(
            PREVIEW_DATA.wallet.referenceUtxos.previewTasteTest.assets
          ).filter(([key]) => key !== "lovelace")
        )
      ),
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
      ownerAddress: ownerAddress,
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
    [...Array(nonAdaReferralBuiltTx.body().outputs().length).keys()].forEach(
      (index) => {
        const output = nonAdaReferralBuiltTx
          .body()
          .outputs()
          .find((_, outputIndex) => outputIndex === index);

        // min-utxo
        if (!output || output.amount().coin() !== 1155080n) {
          return;
        }

        const asset = output
          .amount()
          .multiasset()
          ?.get(
            Core.AssetId(
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb569555344"
            )
          );

        if (!asset || asset !== 1000000n) {
          return;
        }

        if (output.address().toBech32() !== referralFeeAddress) {
          return;
        }

        hasNonAdaReferralFee = true;
      }
    );

    expect(hasNonAdaReferralFee).toBeTruthy();

    // Test Labels
    /**
     * @TODO fix when metadata is fixed
     */
    // expect(
    //   adaReferralBuiltTx.txComplete
    //     .auxiliary_data()
    //     ?.metadata()
    //     ?.get(C.BigNum.from_str("674"))
    //     ?.as_text()
    // ).toEqual("Test Label: 1 ADA");
    // expect(
    //   nonAdaReferralBuiltTx.txComplete
    //     .auxiliary_data()
    //     ?.metadata()
    //     ?.get(C.BigNum.from_str("674"))
    //     ?.as_text()
    // ).toEqual("Non-Ada Test Label: 1 iUSD");
  });
});
export {};
