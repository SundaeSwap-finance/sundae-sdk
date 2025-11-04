import { Blaze, Provider, TxBuilder, Wallet } from "@blaze-cardano/sdk";
import {
  EContractVersion,
  IComposedTx,
  IMintPoolConfigArgs,
} from "../@types/index.js";
import { DatumBuilderStableswaps } from "../DatumBuilders/DatumBuilder.Stableswaps.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { TxBuilderV3 } from "./TxBuilder.V3.class.js";
import { Transaction } from "@blaze-cardano/core";

export class TxBuilderStableswaps extends TxBuilderV3 {
  contractVersion: EContractVersion = EContractVersion.Stableswaps;

  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super(blaze, queryProvider);
    this.datumBuilder = new DatumBuilderStableswaps(this.network);
  }

  async mintPool(
    args: IMintPoolConfigArgs,
  ): Promise<IComposedTx<TxBuilder, Transaction>> {
    if (!args.protocolFees) {
      const settingsDatum = await this.getSettingsUtxoDatum();
      args.protocolFees = (
        this.datumBuilder as DatumBuilderStableswaps
      ).protocolFeesFromSettingsDatum(settingsDatum);
    }
    return super.mintPool(args);
  }
}
