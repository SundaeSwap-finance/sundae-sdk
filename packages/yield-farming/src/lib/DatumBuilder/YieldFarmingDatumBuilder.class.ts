import {
  BlazeHelper,
  DatumBuilderAbstract,
  TDatumResult,
  TSupportedNetworks,
} from "@sundaeswap/core";

import { serialize } from "@blaze-cardano/data";
import { Delegation, TDelegation } from "../../@types/blaze.js";
import { ILockArguments } from "../../@types/configs.js";

/**
 * The Blaze representation of a DatumBuilder. The primary purpose of this class
 * is to encapsulate the accurate building of valid datums, which should be attached
 * to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
 * smart contracts. These datums ensure accurate business logic and the conform to the
 * specs as defined in the SundaeSwap smart contracts.
 */
export class YieldFarmingDatumBuilder implements DatumBuilderAbstract {
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
    const paymentPart = BlazeHelper.getPaymentHashFromBech32(owner.address);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(owner.address);
    const delegationData: TDelegation = {
      owner: {
        address: stakingPart || paymentPart,
      },
      programs,
    };

    const data = serialize(Delegation, delegationData);
    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: delegationData,
    };
  }
}
