import {
  DatumBuilder,
  TDatumResult,
  TSupportedNetworks,
} from "@sundaeswap/core";
import { LucidHelper } from "@sundaeswap/core/lucid";
import { Data } from "lucid-cardano";

import { GummiWormTypes } from "../@types/index.js";

interface IDepositDatumArgs {
  address: string;
}

/**
 * The Lucid representation of a DatumBuilder. The primary purpose of this class
 * is to encapsulate the accurate building of valid datums, which should be attached
 * to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
 * smart contracts. These datums ensure accurate business logic and the conform to the
 * specs as defined in the SundaeSwap smart contracts.
 */
export class DatumBuilderLucid implements DatumBuilder {
  public network: TSupportedNetworks;

  constructor(network: TSupportedNetworks) {
    this.network = network;
  }

  buildDepositDatum({
    address,
  }: IDepositDatumArgs): TDatumResult<GummiWormTypes.TDestinationDatum> {
    const { paymentCredentials, stakeCredentials } =
      LucidHelper.getAddressHashes(address);

    const datum: GummiWormTypes.TDestinationDatum = {
      address: {
        paymentCredential: LucidHelper.isScriptAddress(address)
          ? {
              SCredential: {
                bytes: paymentCredentials,
              },
            }
          : {
              VKeyCredential: {
                bytes: paymentCredentials,
              },
            },

        stakeCredential: stakeCredentials
          ? {
              keyHash: {
                VKeyCredential: {
                  bytes: stakeCredentials,
                },
              },
            }
          : null,
      },
      datum: "NoDatum",
    };

    const inline = Data.to(datum, GummiWormTypes.DestinationDatum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }
}
