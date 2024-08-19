import {
  DatumBuilder,
  TDatumResult,
  TSupportedNetworks,
} from "@sundaeswap/core";
import { LucidHelper } from "@sundaeswap/core/lucid";
import { Data } from "lucid-cardano";

import { ILockArguments } from "../../@types/index.js";
import { Delegation, TDelegation } from "../../@types/lucid.js";

/**
 * The Lucid representation of a DatumBuilder. The primary purpose of this class
 * is to encapsulate the accurate building of valid datums, which should be attached
 * to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
 * smart contracts. These datums ensure accurate business logic and the conform to the
 * specs as defined in the SundaeSwap smart contracts.
 */
export class DatumBuilderLucid implements DatumBuilder {
  constructor(public network: TSupportedNetworks) {}

  /**
   * Builds the datum for asset locking, including LP tokens and other
   * native Cardano assets. There is no need to include an unlockDatum
   * method, because unlock is equivalent to withdrawing all of a user's
   * funds.
   */
  buildLockDatum({
    owner,
    programs,
  }: ILockArguments["delegation"]): TDatumResult<TDelegation> {
    LucidHelper.validateAddressNetwork(owner.address, this.network);
    const addressDetails = LucidHelper.getAddressHashes(owner.address);
    const delegationData: TDelegation = {
      owner: {
        address:
          addressDetails?.stakeCredentials ??
          addressDetails?.paymentCredentials,
      },
      programs,
    };

    const inline = Data.to(delegationData, Delegation);
    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: delegationData,
    };
  }
}
