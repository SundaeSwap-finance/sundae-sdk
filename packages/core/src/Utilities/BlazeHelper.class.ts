import { Core, Data } from "@blaze-cardano/sdk";

import { EDatumType, TDatum, TSupportedNetworks } from "../@types/index.js";

/**
 * A helper class that provides utility functions for validating and processing
 * Cardano addresses. These functions include:
 * - Parsing address hashes from a Bech32 or hex encoded address
 * - Validating an address as being a valid Cardano address and that it is on the correct network
 * - Checking if an address is a script address
 * - Validating that an address matches the given network
 * - Throwing an error if the address is on the wrong network
 * - Throwing an error if an invalid address is supplied
 *
 * @example
 * ```typescript
 *  const hashes = LucidHelper.getAddressHashes("addr_test...")
 *  LucidHelper.validateAddressAndDatumAreValid({ address: "addr_test...", network: "mainnet" });
 *  const isScript = LucidHelper.isScriptAddress("addr_test...");
 * ```
 */
export class BlazeHelper {
  /**
   * Helper function to parse addresses hashes from a Bech32 or hex encoded address.
   * @param address
   * @returns
   */
  static getAddressHashes(address: string): {
    paymentCredentials: string;
    stakeCredentials?: string;
  } {
    const details = Core.Address.fromBech32(address);

    const paymentCred = details.asBase()?.getPaymentCredential();
    if (!paymentCred) {
      throw new Error(
        "Invalid address. Make sure you are using a Bech32 or Hex encoded address that includes the payment key."
      );
    }

    return {
      paymentCredentials: paymentCred.hash,
      stakeCredentials: details.asBase()?.getStakeCredential()?.hash,
    };
  }

  /**
   * Validates that an address and optional datum are valid,
   * and that the address is on the correct network.
   */
  static validateAddressAndDatumAreValid({
    address,
    datum,
    network,
  }: {
    address: string;
    datum: TDatum;
    network: TSupportedNetworks;
  }): void | never {
    BlazeHelper.validateAddressNetwork(address, network);
    const isScript = BlazeHelper.isScriptAddress(address);

    if (isScript) {
      if (datum.type === EDatumType.NONE) {
        BlazeHelper.throwInvalidOrderAddressesError(
          address,
          `The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed.`
        );
      }

      try {
        if (datum.type === EDatumType.HASH) {
          Core.DatumHash.fromHexBlob(Core.HexBlob(datum.value));
        } else {
          Data.from(
            Core.PlutusData.fromCbor(Core.HexBlob(datum.value)),
            Data.Any()
          );
        }
      } catch (e) {
        BlazeHelper.throwInvalidOrderAddressesError(
          address,
          `The datum provided was not a valid hex string. Original error: ${JSON.stringify(
            {
              datum,
              originalErrorMessage: (e as Error).message,
            }
          )}`
        );
      }
    }
  }

  /**
   * Helper function to check if an address is a script address.
   * @param address The Bech32 encoded address.
   * @returns
   */
  static isScriptAddress(address: string): boolean {
    // Ensure that the address can be serialized.
    const realAddress = Core.Address.fromBech32(address);

    // Ensure the datumHash is valid HEX if the address is a script.
    const isScript =
      (Buffer.from(realAddress.toBytes(), "hex")[0] & 0b00010000) !== 0;

    return isScript;
  }

  /**
   * Validates that an address matches the provided network.
   */
  static validateAddressNetwork(
    address: string,
    network: TSupportedNetworks
  ): void | never {
    let details: Core.Address;
    try {
      details = Core.Address.fromBech32(address);
    } catch (e) {
      BlazeHelper.throwInvalidOrderAddressesError(
        address,
        (e as Error).message
      );
    }

    BlazeHelper.maybeThrowNetworkError(
      details.getNetworkId(),
      address,
      network
    );
  }

  /**
   * Throws a useful error if the address, network, and instance network are on the wrong network.
   * @param addressNetwork
   * @param address
   */
  static maybeThrowNetworkError(
    addressNetwork: number,
    address: string,
    network: TSupportedNetworks
  ): never | void {
    if (addressNetwork !== 1 && network === "mainnet") {
      BlazeHelper.throwInvalidOrderAddressesError(
        address,
        `The given address is not a Mainnet Network address: ${address}.`
      );
    }

    if (addressNetwork !== 0 && network === "preview") {
      BlazeHelper.throwInvalidOrderAddressesError(
        address,
        `The given address is not a (Preview/Testnet/PreProd) Network address: ${address}.`
      );
    }
  }

  static inlineDatumToHash(inline: string): string {
    return Core.PlutusData.fromCbor(Core.HexBlob(inline)).hash();
  }

  /**
   * Throws an error describing the address and contextual information.
   */
  static throwInvalidOrderAddressesError(
    address: string,
    errorMessage: string
  ): never {
    throw new Error(
      `You supplied an invalid address: ${address}. Please check your arguments and try again. Error message from LucidHelper: ${errorMessage}`
    );
  }
}
