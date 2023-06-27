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
import { AssetAmount } from "@sundaeswap/asset";

import { DatumBuilder } from "../classes/Abstracts/DatumBuilder.abstract.class";
import { OrderAddresses, PoolCoin } from "../@types/datumbuilder";
import { LucidHelper } from "../classes/Extensions/LucidHelper.class";

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

      expect(result.cbor).toStrictEqual(
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

      expect(result2.cbor).toStrictEqual(
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

      expect(result.cbor).toStrictEqual(
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

      expect(result2.cbor).toStrictEqual(
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

      expect(result.cbor).toStrictEqual(
        "d8799f4103d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff1a002625a0d87a9f1a01312d00ffff"
      );
    });
  });

  describe("DatumBuilderLucid.buildOrderAddressesDatum", () => {
    it("should pass when providing valid OrderAddresses arguments", () => {
      const result = builderInstance.buildOrderAddresses(
        DEFAULT_ORDER_ADDRESSES
      );
      expect(result.cbor).toStrictEqual(
        "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffff"
      );

      const result2 = builderInstance.buildOrderAddresses({
        DestinationAddress: DEFAULT_ORDER_ADDRESSES.DestinationAddress,
      });

      expect(result2.cbor).toStrictEqual(
        "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff"
      );

      const result3 = builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address:
            "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
        },
      });

      expect(result3.cbor).toStrictEqual(
        "d8799fd8799fd8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ffd87a80ffd87a80ffd87a80ff"
      );

      const testDatum = builderInstance.buildOrderAddresses(
        DEFAULT_ORDER_ADDRESSES
      );
      const result4 = builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address: DEFAULT_ORDER_ADDRESSES.DestinationAddress.address,
          datumHash: testDatum.cbor,
        },
      });

      expect(result4.cbor).toStrictEqual(
        "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd8799f5f5840d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc98583d82457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c02659dc406e1d51c2695bc23962b30487d3ceb995beb13b698509c6fffffffffffd87a80ff"
      );
    });

    it("should fail when passing just a staking key as the DestinationAddress", () => {
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address:
              "stake_test1uqxn89tuq7kdmhkvnzpy2ldz9uz7p5vf7l7ftvvh9ek4zpghgvr36",
          },
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "Invalid address. Make sure you are using a Bech32 or Hex encoded address that includes the payment key."
        );
      }
    });

    it("should fail with non-serializable address strings", () => {
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address: "invalid",
          },
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "You supplied an invalid address: invalid. Please check your arguments and try again. Error message from LucidHelper: No address type matched for: invalid"
        );
      }

      try {
        builderInstance.buildOrderAddresses({
          ...DEFAULT_ORDER_ADDRESSES,
          AlternateAddress: "invalid",
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "You supplied an invalid address: invalid. Please check your arguments and try again. Error message from LucidHelper: No address type matched for: invalid"
        );
      }
    });

    it("should fail when passing a Preview Network DestinationAddress to an Mainnet instance", () => {
      try {
        builderInstance.network = "mainnet";
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address: DEFAULT_ORDER_ADDRESSES.DestinationAddress.address,
          },
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message from LucidHelper: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294."
        );
      }
    });

    it("should fail when passing a Mainnet DestinationAddress to a Preview instance", () => {
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            // Taken randomly from Cardanoscan
            address:
              "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
          },
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message from LucidHelper: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk."
        );
      }
    });

    it("should fail when passing a Preview Network AlternateAddress to an Mainnet instance", () => {
      try {
        builderInstance.network = "mainnet";
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address:
              "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
          },
          AlternateAddress:
            "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message from LucidHelper: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294."
        );
      }
    });

    it("should fail when passing a Mainnet Network AlternateAddress to an Preview instance", () => {
      try {
        builderInstance.buildOrderAddresses({
          ...DEFAULT_ORDER_ADDRESSES,
          AlternateAddress:
            "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
        });
      } catch (e) {
        expect((e as Error).message).toStrictEqual(
          "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message from LucidHelper: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk."
        );
      }
    });

    it("should fail when passing a script address to DestinationAddress without a datumHash attached", () => {
      jest.spyOn(LucidHelper, "throwInvalidOrderAddressesError");
      try {
        builderInstance.buildOrderAddresses({
          DestinationAddress: {
            address:
              "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
          },
        });
      } catch (e) {
        expect(
          LucidHelper.throwInvalidOrderAddressesError
        ).toHaveBeenCalledWith(
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
          "The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed."
        );
      }
    });

    it("should fail when passing an invalid datumHash along with a script DestinationAddress", () => {
      jest.spyOn(LucidHelper, "throwInvalidOrderAddressesError");
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
          LucidHelper.throwInvalidOrderAddressesError
        ).toHaveBeenCalledWith(
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
          'The datumHash provided was not a valid hex string. Original error: {"datum":"invalidDatum"}'
        );
      }
    });
  });
};
