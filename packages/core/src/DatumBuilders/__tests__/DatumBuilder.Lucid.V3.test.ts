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

import { Lucid } from "lucid-cardano";
import { EDatumType } from "../../@types/index.js";
import { LucidHelper } from "../../exports/lucid.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { ADA_METADATA } from "../../exports/utilities.js";
import { DatumBuilderLucidV3 } from "../DatumBuilder.Lucid.V3.class.js";
import { TSignatureSchema } from "../contracts/contracts.v3.js";
import { V3Types } from "../contracts/index.js";

let builderInstance: DatumBuilderLucidV3;

const DEFAULT_DESTINATION_ADDRESS = PREVIEW_DATA.addresses.alternatives[2];

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildDestinationAddresses()", () => {
  it("should pass when providing a valid DestinationAddress argument", () => {
    // With staking credential.
    const result = builderInstance.buildDestinationAddresses({
      datum: {
        type: EDatumType.NONE,
      },
      address: DEFAULT_DESTINATION_ADDRESS,
    });
    expect(result.inline).toStrictEqual(
      "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87980ff"
    );

    // Without staking credential.
    const result2 = builderInstance.buildDestinationAddresses({
      datum: {
        type: EDatumType.NONE,
      },
      address:
        "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
    });

    expect(result2.inline).toStrictEqual(
      "d8799fd8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ffd87a80ffd87980ff"
    );

    const { hash, inline } = builderInstance.buildDestinationAddresses({
      datum: {
        type: EDatumType.NONE,
      },
      address: DEFAULT_DESTINATION_ADDRESS,
    });
    const result4 = builderInstance.buildDestinationAddresses({
      address: DEFAULT_DESTINATION_ADDRESS,
      datum: {
        type: EDatumType.HASH,
        value: hash,
      },
    });

    expect(result4.inline).toStrictEqual(
      "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a9f5820a37a97d7c424ff00ff2c6413f9cc429e098623a73c440e8210cdb573a45fad5effff"
    );

    const result5 = builderInstance.buildDestinationAddresses({
      address: DEFAULT_DESTINATION_ADDRESS,
      datum: {
        type: EDatumType.INLINE,
        value: inline,
      },
    });

    expect(result5.inline).toEqual(
      "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87b9fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87980ffffff"
    );
  });

  it("should fail when an invalid DatumType is used", () => {
    expect(() =>
      builderInstance.buildDestinationAddresses({
        datum: {
          // @ts-ignore
          type: "notvalid",
        },
        address: DEFAULT_DESTINATION_ADDRESS,
      })
    ).toThrowError(
      "Could not find a matching datum type for the destination address. Aborting."
    );
  });

  it("should fail when passing just a staking key as the DestinationAddress", () => {
    try {
      builderInstance.buildDestinationAddresses({
        address:
          "stake_test1uqxn89tuq7kdmhkvnzpy2ldz9uz7p5vf7l7ftvvh9ek4zpghgvr36",
        datum: {
          type: EDatumType.NONE,
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
      builderInstance.buildDestinationAddresses({
        address: "invalid",
        datum: {
          type: EDatumType.NONE,
        },
      })
    ).toThrowError(
      "You supplied an invalid address: invalid. Please check your arguments and try again. Error message from LucidHelper: No address type matched for: invalid"
    );
  });

  it("should fail when passing a Preview Network DestinationAddress to an Mainnet instance", () => {
    builderInstance.network = "mainnet";
    expect(() =>
      builderInstance.buildDestinationAddresses({
        address: DEFAULT_DESTINATION_ADDRESS,
        datum: {
          type: EDatumType.NONE,
        },
      })
    ).toThrowError(
      "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message from LucidHelper: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294."
    );
  });

  it("should fail when passing a Mainnet DestinationAddress to a Preview instance", () => {
    expect(() =>
      builderInstance.buildDestinationAddresses({
        // Taken randomly from Cardanoscan
        address:
          "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
        datum: {
          type: EDatumType.NONE,
        },
      })
    ).toThrowError(
      "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message from LucidHelper: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk."
    );
  });

  it("should fail when passing a script address to DestinationAddress without a datumHash attached", () => {
    jest.spyOn(LucidHelper, "throwInvalidOrderAddressesError");
    try {
      builderInstance.buildDestinationAddresses({
        address:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        datum: {
          type: EDatumType.NONE,
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
      builderInstance.buildDestinationAddresses({
        address:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        datum: {
          type: EDatumType.HASH,
          value: "invalidDatum",
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

describe("buildOwnerDatum()", () => {
  it("should build the owner datum properly", () => {
    const spiedLucidHelperThrow = jest.spyOn(
      LucidHelper,
      "throwInvalidOrderAddressesError"
    );
    const spiedLucidHelperAddressHashes = jest.spyOn(
      LucidHelper,
      "getAddressHashes"
    );

    const result = builderInstance.buildOwnerDatum(
      PREVIEW_DATA.addresses.current
    );

    expect(spiedLucidHelperAddressHashes).toHaveBeenCalledWith(
      PREVIEW_DATA.addresses.current
    );
    expect(spiedLucidHelperThrow).not.toHaveBeenCalled();
    expect(result.inline).toEqual(
      "d8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff"
    );
    expect(result.hash).toEqual(
      "eacbeb744f70afc638bd8e610fc8c91d5761da59ace673aeb3cb23a3f9fb5eab"
    );
    expect(result.schema).toMatchObject<TSignatureSchema>({
      Address: {
        hex: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
      },
    });
  });
});

describe("buildAssetDatum", () => {
  it("should correctly build the datum for ADA", () => {
    const result = builderInstance.buildAssetAmountDatum(
      new AssetAmount(100n, ADA_METADATA)
    );
    expect(result.inline).toEqual("9f40401864ff");
  });

  it("should correctly build the datum for alt-coin", () => {
    const result = builderInstance.buildAssetAmountDatum(
      new AssetAmount(100_000_000n, {
        ...ADA_METADATA,
        assetId:
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.44554d4d59",
      })
    );
    expect(result.inline).toEqual(
      "9f581cd441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf4544554d4d591a05f5e100ff"
    );
  });
});

describe("static getDestinationAddressesFromDatum()", () => {
  it("should properly extract the addresses from the datum", () => {
    const exampleDatum =
      "d8799fd8799f4106ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a0010c8e0d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401a01312d00ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a008cf2d7ffffd87980ff";
    const expectedAddresses = {
      paymentKeyHash:
        "c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a",
      stakingKeyHash:
        "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
    };

    expect(
      DatumBuilderLucidV3.getDestinationAddressesFromDatum(exampleDatum)
    ).toMatchObject(expectedAddresses);
  });
});

describe("static addressSchemaToCredential", () => {
  it("should correctly convert address schemas to their Credentials", async () => {
    const lucidInstance = await Lucid.new(undefined, "Preview");
    const paymentAddress: V3Types.TAddressSchema = {
      paymentCredential: {
        VKeyCredential: {
          bytes: "c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a",
        },
      },
      stakeCredential: null,
    };

    expect(
      DatumBuilderLucidV3.addressSchemaToBech32(paymentAddress, lucidInstance)
    ).toEqual(
      "addr_test1vrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wkswmc787"
    );

    const paymentAddressWithStakingKey: V3Types.TAddressSchema = {
      paymentCredential: {
        VKeyCredential: {
          bytes: "c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a",
        },
      },
      stakeCredential: {
        keyHash: {
          VKeyCredential: {
            bytes: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
          },
        },
      },
    };

    expect(
      DatumBuilderLucidV3.addressSchemaToBech32(
        paymentAddressWithStakingKey,
        lucidInstance
      )
    ).toEqual(
      "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s"
    );

    const scriptAddress: V3Types.TAddressSchema = {
      paymentCredential: {
        SCredential: {
          bytes: "cfad1914b599d18bffd14d2bbd696019c2899cbdd6a03325cdf680bc",
        },
      },
      stakeCredential: null,
    };

    expect(
      DatumBuilderLucidV3.addressSchemaToBech32(scriptAddress, lucidInstance)
    ).toEqual(
      "addr_test1wr866xg5kkvarzll69xjh0tfvqvu9zvuhht2qve9ehmgp0qfgf3wc"
    );

    const scriptAddressWithStakingKey: V3Types.TAddressSchema = {
      paymentCredential: {
        SCredential: {
          bytes: "cfad1914b599d18bffd14d2bbd696019c2899cbdd6a03325cdf680bc",
        },
      },
      stakeCredential: {
        keyHash: {
          VKeyCredential: {
            bytes: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
          },
        },
      },
    };

    expect(
      DatumBuilderLucidV3.addressSchemaToBech32(
        scriptAddressWithStakingKey,
        lucidInstance
      )
    ).toEqual(
      "addr_test1zr866xg5kkvarzll69xjh0tfvqvu9zvuhht2qve9ehmgp0qjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngq4qar8t"
    );
  });
});
