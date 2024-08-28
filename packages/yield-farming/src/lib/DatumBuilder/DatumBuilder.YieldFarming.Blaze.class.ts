import { Data } from "@blaze-cardano/sdk";
import {
  DatumBuilder,
  TDatumResult,
  TSupportedNetworks,
} from "@sundaeswap/core";
import { BlazeHelper } from "@sundaeswap/core/blaze";

import { Delegation, TDelegation } from "../../@types/blaze.js";
import { ILockArguments } from "../../@types/configs.js";

/**
 * The Blaze representation of a DatumBuilder. The primary purpose of this class
 * is to encapsulate the accurate building of valid datums, which should be attached
 * to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
 * smart contracts. These datums ensure accurate business logic and the conform to the
 * specs as defined in the SundaeSwap smart contracts.
 */
export class DatumBuilderBlaze implements DatumBuilder {
  public network: TSupportedNetworks;

  constructor(network: TSupportedNetworks) {
    this.network = network;
  }

  /**
   * Builds the datum for asset locking, including LP tokens and other
   * native Cardano assets. There is no need to include an unlockDatum
   * method, because unlock is equivalent to withdrawing all of a user's
   * funds.
   */
  buildLockDatum({
    owner,
    programs,
  }: ILockArguments<TDelegation>["delegation"]): TDatumResult<TDelegation> {
    BlazeHelper.validateAddressNetwork(owner.address, this.network);
    const addressDetails = BlazeHelper.getAddressHashes(owner.address);
    const delegationData: TDelegation = {
      owner: {
        address:
          addressDetails?.stakeCredentials ??
          addressDetails?.paymentCredentials,
      },
      programs,
    };

    const data = Data.to(delegationData, Delegation);
    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: delegationData,
    };
  }
}
