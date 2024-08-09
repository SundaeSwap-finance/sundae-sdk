import { jest } from "@jest/globals";

import { EDatumType } from "../../../@types/datumbuilder.js";
import { PREVIEW_DATA } from "../../../exports/testing.js";
import { BlazeHelper } from "../../../Utilities/BlazeHelper.class.js";
import { DatumBuilderBlazeV1 } from "../../DatumBuilder.Blaze.V1.class.js";

let builderInstance: DatumBuilderBlazeV1;

const DEFAULT_DESTINATION_ADDRESS = PREVIEW_DATA.addresses.alternatives[2];

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildDestinationAddresses()", () => {
  it("should pass when providing a valid DestinationAddress argument", () => {
    // With staking credential.
    const result = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        address: DEFAULT_DESTINATION_ADDRESS,
        datum: {
          type: EDatumType.NONE,
        },
      },
    });
    expect(result.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff"
    );

    // Without staking credential.
    const result2 = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        datum: {
          type: EDatumType.NONE,
        },
        address:
          "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
      },
    });

    expect(result2.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ffd87a80ffd87a80ffd87a80ff"
    );

    const { hash, inline } = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        datum: {
          type: EDatumType.NONE,
        },
        address: DEFAULT_DESTINATION_ADDRESS,
      },
    });
    const result4 = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        address: DEFAULT_DESTINATION_ADDRESS,
        datum: {
          type: EDatumType.HASH,
          value: hash,
        },
      },
    });

    expect(result4.inline).toStrictEqual(
      "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd8799f5820837c3df94f875534d8d3ff3a4b371df815df004acd2e11ddd509ec26f8c26625ffffd87a80ff"
    );
    expect(result4.hash).toStrictEqual(
      "b529a0aaa399367d664c5aaca86f24f9c5da39734806e912daec2f56a55c7e86"
    );

    const resultWithScriptDestination = builderInstance.buildOrderAddresses({
      DestinationAddress: {
        address:
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe",
        datum: {
          type: EDatumType.HASH,
          value: result4.hash,
        },
      },
    });

    expect(
      resultWithScriptDestination.inline.includes(result4.hash)
    ).toBeTruthy();
    expect(resultWithScriptDestination.inline).toEqual(
      "d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f5820b529a0aaa399367d664c5aaca86f24f9c5da39734806e912daec2f56a55c7e86ffffd87a80ff"
    );
  });

  it("should fail when an invalid DatumType is used", () => {
    expect(() =>
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address: DEFAULT_DESTINATION_ADDRESS,
          datum: {
            type: EDatumType.INLINE,
            value:
              "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
          },
        },
      })
    ).toThrowError(
      "Inline datum types are not supported in V1 contracts! Convert this to a hash."
    );

    expect(() =>
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          datum: {
            // @ts-ignore
            type: "notvalid",
          },
          address: DEFAULT_DESTINATION_ADDRESS,
        },
      })
    ).toThrowError(
      "Could not find a matching datum type for the destination address. Aborting."
    );
  });

  it("should fail when passing just a staking key as the DestinationAddress", () => {
    try {
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address:
            "stake_test1uqxn89tuq7kdmhkvnzpy2ldz9uz7p5vf7l7ftvvh9ek4zpghgvr36",
          datum: {
            type: EDatumType.NONE,
          },
        },
      });
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        "Invalid address. Make sure you are using a Bech32 or Hex encoded address that includes the payment key."
      );
    }
  });
  it("should fail with non-serializable address strings", () => {
    expect(() =>
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address: "invalid",
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
    ).toThrowError(
      "You supplied an invalid address: invalid. Please check your arguments and try again. Error message from BlazeHelper: Wrong string length: 7 (invalid). Expected (8..1023)"
    );
  });
  it("should fail when passing a Preview Network DestinationAddress to an Mainnet instance", () => {
    builderInstance.network = "mainnet";
    expect(() =>
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address: DEFAULT_DESTINATION_ADDRESS,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
    ).toThrowError(
      "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message from BlazeHelper: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294."
    );
  });
  it("should fail when passing a Mainnet DestinationAddress to a Preview instance", () => {
    expect(() =>
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          // Taken randomly from Cardanoscan
          address:
            "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
    ).toThrowError(
      "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message from BlazeHelper: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk."
    );
  });
  it("should fail when passing a script address to DestinationAddress without a datum attached", () => {
    jest.spyOn(BlazeHelper, "throwInvalidOrderAddressesError");
    try {
      builderInstance.buildOrderAddresses({
        DestinationAddress: {
          address:
            "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
          datum: {
            type: EDatumType.NONE,
          },
        },
      });
    } catch (e) {
      expect(BlazeHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        "The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed."
      );
    }
  });
  it("should fail when passing an invalid datum along with a script DestinationAddress", () => {
    jest.spyOn(BlazeHelper, "throwInvalidOrderAddressesError");
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
      expect(BlazeHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        'The datum provided was not a valid hex string. Original error: {"datum":{"type":"HASH","value":"invalidDatum"},"originalErrorMessage":"Invalid string: \\"expected hex string\\""}'
      );
    }
  });
});
