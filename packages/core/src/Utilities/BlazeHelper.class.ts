import { parse, Type } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
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
 *  const hashes = BlazeHelper.getAddressHashes("addr_test...")
 *  BlazeHelper.validateAddressAndDatumAreValid({ address: "addr_test...", network: "mainnet" });
 *  const isScript = BlazeHelper.isScriptAddress("addr_test...");
 * ```
 */
export class BlazeHelper {
  /**
   * Helper function to parse addresses hashes from a Bech32 encoded address.
   * @param address
   * @returns
   */
  static getAddressAsType(address: string): {
    address: Core.Address;
    type: Core.AddressType;
  } {
    const details = Core.Address.fromBech32(address);
    const addressType = details.getType();

    return { address: details, type: addressType };
  }

  /**
   * Helper method to determine address type.
   *
   * @param {Core.AddressType} type The address type.
   * @returns {boolean}
   */
  static isEnterpriseAddress(type: Core.AddressType): boolean {
    return (
      type === Core.AddressType.EnterpriseKey ||
      type === Core.AddressType.EnterpriseScript
    );
  }

  /**
   * Helper method to determine address type.
   *
   * @param {Core.AddressType} type The address type.
   * @returns {boolean}
   */
  static isBaseAddress(type: Core.AddressType): boolean {
    return (
      type === Core.AddressType.BasePaymentKeyStakeKey ||
      type === Core.AddressType.BasePaymentKeyStakeScript ||
      type === Core.AddressType.BasePaymentScriptStakeKey ||
      type === Core.AddressType.BasePaymentScriptStakeScript
    );
  }

  static isScriptAddress(address: string): boolean {
    const { type } = BlazeHelper.getAddressAsType(address);
    return (
      type === Core.AddressType.BasePaymentScriptStakeKey ||
      type === Core.AddressType.BasePaymentScriptStakeScript ||
      type === Core.AddressType.EnterpriseScript ||
      type === Core.AddressType.PointerScript ||
      type === Core.AddressType.RewardScript
    );
  }

  static getPaymentHashFromBech32(address: string) {
    const addr = BlazeHelper.getAddressAsType(address);
    let paymentPart: string | undefined;
    if (BlazeHelper.isBaseAddress(addr.type)) {
      paymentPart = addr.address.asBase()?.getPaymentCredential().hash;
    } else if (BlazeHelper.isEnterpriseAddress(addr.type)) {
      paymentPart = addr.address.asEnterprise()?.getPaymentCredential().hash;
    }

    if (!paymentPart) {
      throw new Error(
        `Could not find a payment key in the address: ${address}`,
      );
    }

    return paymentPart;
  }

  static getStakingHashFromBech32(address: string) {
    const addr = BlazeHelper.getAddressAsType(address);
    let paymentPart: string | undefined;
    if (BlazeHelper.isBaseAddress(addr.type)) {
      paymentPart = addr.address.asBase()?.getStakeCredential().hash;
    }

    return paymentPart;
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
    if (
      ![EDatumType.NONE, EDatumType.HASH, EDatumType.INLINE].includes(
        datum.type,
      )
    ) {
      throw new Error(
        "Could not find a matching datum type for the destination address. Aborting.",
      );
    }

    const isScript = BlazeHelper.isScriptAddress(address);
    if (isScript) {
      if (datum.type === EDatumType.NONE) {
        BlazeHelper.throwInvalidOrderAddressesError(
          address,
          `The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed.`,
        );
      }

      try {
        if (datum.type === EDatumType.HASH) {
          Core.DatumHash.fromHexBlob(Core.HexBlob(datum.value));
        } else {
          parse(
            Type.Unsafe<Core.PlutusData>(Type.Any()),
            Core.PlutusData.fromCbor(Core.HexBlob(datum.value)),
          );
        }
      } catch (e) {
        BlazeHelper.throwInvalidOrderAddressesError(
          address,
          `The datum provided was not a valid hex string. Original error: ${JSON.stringify(
            { datum, originalErrorMessage: (e as Error).message },
          )}`,
        );
      }
    }
  }

  /**
   * Validates that an address matches the provided network.
   */
  static validateAddressNetwork(
    address: string,
    network: TSupportedNetworks,
  ): void | never {
    let details: Core.Address;
    try {
      details = Core.Address.fromBech32(address);
    } catch (e) {
      BlazeHelper.throwInvalidOrderAddressesError(
        address,
        (e as Error).message,
      );
    }

    BlazeHelper.maybeThrowNetworkError(
      details.getNetworkId(),
      address,
      network,
    );
  }

  static throwNoPaymentKeyError(address?: string): never {
    let error =
      "Invalid address. Make sure you are using a Bech32 encoded address that includes the payment key.";
    if (address) {
      error += ` Provided address: ${address}`;
    }

    throw new Error(error);
  }

  /**
   * Throws a useful error if the address, network, and instance network are on the wrong network.
   * @param addressNetwork
   * @param address
   */
  static maybeThrowNetworkError(
    addressNetwork: number,
    address: string,
    network: TSupportedNetworks,
  ): never | void {
    if (addressNetwork !== 1 && network === "mainnet") {
      BlazeHelper.throwInvalidOrderAddressesError(
        address,
        `The given address is not a Mainnet Network address: ${address}.`,
      );
    }

    if (addressNetwork !== 0 && network === "preview") {
      BlazeHelper.throwInvalidOrderAddressesError(
        address,
        `The given address is not a (Preview/Testnet/PreProd) Network address: ${address}.`,
      );
    }
  }

  static inlineDatumToHash(data: Core.PlutusData): string {
    return Core.PlutusData.fromCbor(data.toCbor()).hash();
  }

  /**
   * Throws an error describing the address and contextual information.
   */
  static throwInvalidOrderAddressesError(
    address: string,
    errorMessage: string,
  ): never {
    throw new Error(
      `You supplied an invalid address: ${address}. Please check your arguments and try again. Error message: ${errorMessage}`,
    );
  }

  /**
   * Helper function to merge to Value instances together into one.
   *
   * @param {(Core.Value | undefined)[]} values - A list of values to merge together.
   * @return {Core.Value}
   */
  static mergeValues(...values: (Core.Value | undefined)[]): Core.Value {
    const newValue = new Core.Value(0n);
    values
      .filter((v) => v !== undefined)
      .forEach((value) => {
        newValue.setCoin(newValue.coin() + value.coin());

        const thisMultiAsset = value.multiasset();
        if (thisMultiAsset) {
          newValue.setMultiasset(new Map());
        } else {
          return;
        }

        const newMultiAssets = newValue.multiasset() as Core.TokenMap;
        thisMultiAsset.forEach((amount, assetId) => {
          const existingAmount = newMultiAssets.get(assetId) || 0n;
          newValue.multiasset()?.set(assetId, existingAmount + amount);
        });
      });

    return newValue;
  }
}
