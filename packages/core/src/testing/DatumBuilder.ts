/**
 * ## DatumBuilder Tests
 *
 * This file exports testing functions to run against your builder.
 * Most tests are automated but ensure that the {@link Core.DatumBuilder}
 * instance you pass in is run against real test data and outputs
 * valid CBOR hex strings to attach to your transactions!
 *
 * For an example, see:
 *
 * @module DatumBuilder
 * @packageDescription
 */
import { jest } from "@jest/globals";
import { DatumBuilder } from "../classes/Abstracts/DatumBuilder.abstract.class";
import { OrderAddresses, PoolCoin } from "../@types";
import { AssetAmount } from "../classes/AssetAmount.class";

const DEFAULT_IDENT = "03";
const DEFAULT_ORDER_ADDRESSES: OrderAddresses = {
  DestinationAddress: {
    address:
      "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
  },
  AlternateAddress:
    "addr_test1qqpxt8wyqmsa28pxjk7z893txpy8608tn9d7kyaknpgfcmcjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqllv3yr",
};

export const TEST_DatumBuilder = (initializer: () => DatumBuilder) => {
  let builderInstance: DatumBuilder;
  beforeEach(() => {
    builderInstance = initializer();
    jest.spyOn(DatumBuilder, "throwInvalidOrderAddressesError");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("DatumBuilderLucid.buildSwapDatum", () => {
    it("should pass when given valid swap arguments", () => {
      const result = builderInstance.buildSwapDatum({
        ident: DEFAULT_IDENT,
        orderAddresses: DEFAULT_ORDER_ADDRESSES,
        swap: {
          SuppliedCoin: PoolCoin.A,
          MinimumReceivable: new AssetAmount(10000000n, 6),
        },
        fundedAsset: {
          amount: new AssetAmount(5000000n, 6),
          assetId: "",
        },
      });

      expect(result.cbor).toEqual(
        "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d8799fd879801a004c4b40d8799f1a00989680ffffff"
      );

      const result2 = builderInstance.buildSwapDatum({
        ident: DEFAULT_IDENT,
        orderAddresses: DEFAULT_ORDER_ADDRESSES,
        swap: {
          SuppliedCoin: PoolCoin.B,
        },
        fundedAsset: {
          amount: new AssetAmount(5000000n, 6),
          assetId: "",
        },
      });

      expect(result2.cbor).toEqual(
        "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d8799fd87a801a004c4b40d87a80ffff"
      );
    });
  });

  describe("DatumBuilderLucid.buildDepositDatum", () => {
    it("should pass when given valid deposit arguments", () => {
      const result = builderInstance.buildDepositDatum({
        ident: DEFAULT_IDENT,
        orderAddresses: DEFAULT_ORDER_ADDRESSES,
        deposit: {
          CoinAAmount: new AssetAmount(20000000n, 6),
          CoinBAmount: new AssetAmount(10000000n, 6),
        },
      });

      expect(result.cbor).toEqual(
        "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d87b9fd87a9fd8799f1a01312d001a00989680ffffffff"
      );

      const result2 = builderInstance.buildDepositDatum({
        ident: DEFAULT_IDENT,
        orderAddresses: {
          DestinationAddress: DEFAULT_ORDER_ADDRESSES.DestinationAddress,
        },
        deposit: {
          CoinAAmount: new AssetAmount(10000000n, 6),
          CoinBAmount: new AssetAmount(20000000n, 6),
        },
      });

      expect(result2.cbor).toEqual(
        "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff1a002625a0d87b9fd87a9fd8799f1a009896801a01312d00ffffffff"
      );
    });
  });

  describe("DatumBuilderLucid.buildWithdrawDatum", () => {
    it("should pass when given valid withdraw arguments", () => {
      const result = builderInstance.buildWithdrawDatum({
        ident: DEFAULT_IDENT,
        orderAddresses: DEFAULT_ORDER_ADDRESSES,
        suppliedLPAsset: {
          amount: new AssetAmount(20000000n, 6),
          assetId: "",
        },
      });

      expect(result.cbor).toEqual(
        "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d87a9f1a01312d00ffff"
      );
    });
  });

  describe("DatumBuilderLucid.buildOrderAddressesDatum", () => {
    it("should pass when providing valid OrderAddresses arguments", () => {
      const result = builderInstance.buildOrderAddresses(
        DEFAULT_ORDER_ADDRESSES
      );
      expect(result.cbor).toEqual(
        "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff"
      );

      const result2 = builderInstance.buildOrderAddresses({
        DestinationAddress: DEFAULT_ORDER_ADDRESSES.DestinationAddress,
      });

      expect(result2.cbor).toEqual(
        "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff"
      );
    });

    it("should fail when passing an invalid DestinationAddress or AlternateAddress", () => {
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address: "invalidAddress",
          },
        });
      } catch (e) {
        expect(
          DatumBuilder.throwInvalidOrderAddressesError
        ).toHaveBeenCalledWith(
          {
            DestinationAddress: {
              address: "invalidAddress",
            },
          },
          "No address type matched for: invalidAddress"
        );
      }

      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: DEFAULT_ORDER_ADDRESSES.DestinationAddress,
          AlternateAddress: "invalidAlternate",
        });
      } catch (e) {
        expect(
          DatumBuilder.throwInvalidOrderAddressesError
        ).toHaveBeenCalledWith(
          {
            DestinationAddress: {
              address:
                "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
            },
            AlternateAddress: "invalidAlternate",
          },
          "No address type matched for: invalidAlternate"
        );
      }
    });

    it("should fail when passing a script address to DestinationAddress without a datumHash attached", () => {
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address:
              "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
          },
        });
      } catch (e) {
        expect(
          DatumBuilder.throwInvalidOrderAddressesError
        ).toHaveBeenCalledWith(
          {
            DestinationAddress: {
              address:
                "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
            },
          },
          "The DestinationAddress is a Script Address, a Datum hash was not supplied. This will brick your funds! Supply a valid DatumHash with your DestinationAddress to proceed."
        );
      }
    });

    it("should fail when passing an invalid datumHash along with a script DestinationAddress", () => {
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address:
              "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
            datumHash: "invalidDatum",
          },
        });
      } catch (e) {
        expect(
          DatumBuilder.throwInvalidOrderAddressesError
        ).toHaveBeenCalledWith(
          {
            DestinationAddress: {
              address:
                "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
              datumHash: "invalidDatum",
            },
          },
          'The datumHash provided was not a valid hex string. Original error: {"datumHash":"invalidDatum"}'
        );
      }
    });
  });
};
