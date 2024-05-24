import { jest } from "@jest/globals";

import { EDatumType, TOrderAddresses } from "../../@types/datumbuilder.js";
import { PREVIEW_DATA } from "../../TestUtilities/mockData.js";
import { LucidHelper } from "../../exports/lucid.js";
import { DatumBuilderLucidV1 } from "../DatumBuilder.Lucid.V1.class.js";

const DEFAULT_ORDER_ADDRESSES: TOrderAddresses = {
  DestinationAddress: {
    datum: {
      type: EDatumType.NONE,
    },
    address:
      "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
  },
  AlternateAddress:
    "addr_test1qqpxt8wyqmsa28pxjk7z893txpy8608tn9d7kyaknpgfcmcjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqllv3yr",
};

let builderInstance: DatumBuilderLucidV1;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("DatumBuilderLucid.buildOrderAddressesDatum", () => {
  it("should pass when providing valid OrderAddresses arguments", () => {
    const result = builderInstance.buildOrderAddresses(DEFAULT_ORDER_ADDRESSES);
    expect(result.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff"
    );

    const result2 = builderInstance.buildOrderAddresses({
      DestinationAddress: DEFAULT_ORDER_ADDRESSES.DestinationAddress,
    });

    expect(result2.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff"
    );

    const result3 = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        datum: {
          type: EDatumType.NONE,
        },
        address:
          "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
      },
    });

    expect(result3.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ffd87a80ffd87a80ffd87a80ff"
    );

    const { hash } = builderInstance.buildOrderAddresses(
      DEFAULT_ORDER_ADDRESSES
    );

    const result4 = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        address: DEFAULT_ORDER_ADDRESSES.DestinationAddress.address,
        datum: {
          type: EDatumType.HASH,
          value: hash,
        },
      },
      AlternateAddress: DEFAULT_ORDER_ADDRESSES.AlternateAddress,
    });

    expect(result4.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd8799f5820334e43eb4307f05c651f9bdf470391c0f7810971a753053549cb1a362b7e14fcffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff"
    );
  });

  it("should fail when passing just a staking key as the DestinationAddress", () => {
    try {
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          datum: {
            type: EDatumType.NONE,
          },
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
          datum: {
            type: EDatumType.NONE,
          },
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
          datum: {
            type: EDatumType.NONE,
          },
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
          datum: {
            type: EDatumType.NONE,
          },
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
          datum: {
            type: EDatumType.NONE,
          },
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

  it("should correctly build and valid a pool ident", () => {
    expect(() =>
      builderInstance.buildPoolIdent(PREVIEW_DATA.pools.v3.ident)
    ).toThrowError(DatumBuilderLucidV1.INVALID_POOL_IDENT);

    const validIdent = builderInstance.buildPoolIdent(
      PREVIEW_DATA.pools.v1.ident
    );
    expect(validIdent).toEqual(PREVIEW_DATA.pools.v1.ident);
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
          datum: {
            type: EDatumType.NONE,
          },
          address:
            "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        },
      });
    } catch (e) {
      expect(LucidHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
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
          datum: {
            type: EDatumType.HASH,
            value: "invalidDatum",
          },
        },
      });
    } catch (e) {
      expect(LucidHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        'The datum provided was not a valid hex string. Original error: {"datum":{"type":"HASH","value":"invalidDatum"}}'
      );
    }
  });
});
