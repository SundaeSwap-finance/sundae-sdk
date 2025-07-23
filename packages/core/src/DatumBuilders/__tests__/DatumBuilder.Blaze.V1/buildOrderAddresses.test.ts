import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";

import { Core } from "@blaze-cardano/sdk";
import {
  EDatumType,
  TOrderAddressesArgs,
} from "../../../@types/datumbuilder.js";
import { VOID_BYTES } from "../../../constants.js";
import { BlazeHelper } from "../../../Utilities/BlazeHelper.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";
import { DatumBuilderV1 } from "../../DatumBuilder.V1.class.js";

let builderInstance: DatumBuilderV1;

const expectations = V1_EXPECTATIONS.datums.buildOrderAddresses;

beforeEach(() => {
  builderInstance = new DatumBuilderV1("preview", new Set(["730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e"]));
});

afterEach(() => {
  mock.restore();
});

describe("buildDestinationAddresses()", () => {
  it("should pass when providing a valid DestinationAddress argument", () => {
    // With staking credential.
    const result = builderInstance.buildOrderAddresses(
      expectations[0].args as TOrderAddressesArgs,
    );
    expect(result.inline).toStrictEqual(
      expectations[0].expectations.inline as string,
    );
    expect(result.hash).toStrictEqual(
      expectations[0].expectations.hash as string,
    );

    // Without staking credential.
    const result2 = builderInstance.buildOrderAddresses(
      expectations[1].args as TOrderAddressesArgs,
    );

    expect(result2.inline).toStrictEqual(
      expectations[1].expectations.inline as string,
    );
    expect(result2.hash).toStrictEqual(
      expectations[1].expectations.hash as string,
    );

    // With hash included in destination address.
    const result3 = builderInstance.buildOrderAddresses(
      expectations[2].args as TOrderAddressesArgs,
    );
    expect(result3.inline).toStrictEqual(
      expectations[2].expectations.inline as string,
    );
    expect(result3.hash).toStrictEqual(
      expectations[2].expectations.hash as string,
    );

    const resultWithScriptDestination = builderInstance.buildOrderAddresses(
      expectations[3].args as TOrderAddressesArgs,
    );

    expect(
      resultWithScriptDestination.inline.includes(
        expectations[2].expectations.hash as string,
      ),
    ).toBeTruthy();
    expect(resultWithScriptDestination.inline).toEqual(
      expectations[3].expectations.inline as string,
    );
    expect(resultWithScriptDestination.hash).toEqual(
      expectations[3].expectations.hash as string,
    );
  });

  it("should fail when an invalid DatumType is used", () => {
    expect(() =>
      builderInstance.buildOrderAddresses(
        expectations[5].args as TOrderAddressesArgs,
      ),
    ).toThrowError(expectations[5].expectations.error);
  });

  it("should fail when passing just a staking key as the DestinationAddress", () => {
    expect(() =>
      builderInstance.buildOrderAddresses(
        expectations[6].args as TOrderAddressesArgs,
      ),
    ).toThrowError(expectations[6].expectations.error);
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
      }),
    ).toThrowError(
      "You supplied an invalid address: invalid. Please check your arguments and try again. Error message: invalid string length: 7 (invalid). Expected (8..1023)",
    );
  });

  it("should fail when passing a Preview Network DestinationAddress to an Mainnet instance", () => {
    builderInstance.network = "mainnet";
    expect(() =>
      builderInstance.buildOrderAddresses(
        expectations[8].args as TOrderAddressesArgs,
      ),
    ).toThrowError(expectations[8].expectations.error);
  });

  it("should fail when passing a Mainnet DestinationAddress to a Preview instance", () => {
    expect(() =>
      builderInstance.buildOrderAddresses(
        expectations[9].args as TOrderAddressesArgs,
      ),
    ).toThrowError(expectations[9].expectations.error);
  });

  it("should fail when passing a script address to DestinationAddress without a datum attached", () => {
    spyOn(BlazeHelper, "throwInvalidOrderAddressesError");
    try {
      builderInstance.buildOrderAddresses(
        expectations[10].args as TOrderAddressesArgs,
      );
    } catch (e) {
      expect(BlazeHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        expectations[10].args.DestinationAddress.address,
        expectations[10].expectations.error,
      );
    }
  });

  it("should fail when passing an invalid datum along with a script DestinationAddress", () => {
    spyOn(BlazeHelper, "throwInvalidOrderAddressesError");
    try {
      builderInstance.buildOrderAddresses(
        expectations[11].args as TOrderAddressesArgs,
      );
    } catch (e) {
      expect(BlazeHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        expectations[11].args.DestinationAddress.address,
        expectations[11].expectations.error,
      );
    }
  });

  it("should throw an error if the destination is a script we are aware of and the datum is not a hash", () => {
    const orderAddress = Core.addressFromCredential(
      0,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16("730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e"),
        type: Core.CredentialType.ScriptHash,
      }),
    ).toBech32();

    expect(() => builderInstance.buildOrderAddresses({
      DestinationAddress: {
        address: orderAddress,
        datum: { type: EDatumType.INLINE, value: VOID_BYTES.toCbor() }
      }
    })).toThrowError("Inline datum types are not supported in V1 contracts! Convert this to a hash.")
  })

  it("should let me attach an inline datum if the destination is NOT a script we are aware of", () => {
    const orderAddress = Core.addressFromCredential(
      0,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16("e6c8a314ae942401619460f00c69de3d1b996db588d4042243a4b259"),
        type: Core.CredentialType.ScriptHash,
      }),
    ).toBech32();

    expect(() => builderInstance.buildOrderAddresses({
      DestinationAddress: {
        address: orderAddress,
        datum: { type: EDatumType.INLINE, value: VOID_BYTES.toCbor() }
      }
    })).not.toThrow()
  })
});
