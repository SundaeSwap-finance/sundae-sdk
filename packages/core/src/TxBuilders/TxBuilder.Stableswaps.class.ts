import { Blaze, Core, Provider, Wallet } from "@blaze-cardano/sdk";
import {
  EContractVersion,
  ISundaeProtocolParamsFull,
} from "../@types/index.js";
import {
  OrderOrderSpend,
  PoolPoolSpend,
  PoolStakePoolStakeElse,
  StakeStakeElse,
} from "../DatumBuilders/ContractTypes/Contract.Stableswaps.js";
import { DatumBuilderStableswaps } from "../DatumBuilders/DatumBuilder.Stableswaps.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { TxBuilderV3 } from "./TxBuilder.V3.class.js";

export class TxBuilderStableswaps extends TxBuilderV3 {
  contractVersion: EContractVersion = EContractVersion.Stableswaps;
  settingsPolicyId: string =
    "85ed0c7060ccd4700927d8b60f0160abe2b3c30446fc0a9ac83b6b76";

  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super(blaze, queryProvider);
    this.datumBuilder = new DatumBuilderStableswaps(this.network);
  }

  /**
   * Retrieves the basic protocol parameters from the SundaeSwap API
   * and fills in a place-holder for the compiled code of any validators.
   *
   * @returns {Promise<ISundaeProtocolParamsFull>}
   */
  public async getProtocolParams(): Promise<ISundaeProtocolParamsFull> {
    if (!this.protocolParams) {
      this.protocolParams =
        (await this.queryProvider.getProtocolParamsWithScripts(
          this.contractVersion,
        )) || (await this.generateProtocolParams());
    }

    return this.protocolParams;
  }

  async generateProtocolParams(): Promise<ISundaeProtocolParamsFull> {
    const poolManageScript = new PoolStakePoolStakeElse(
      this.settingsPolicyId,
      0n,
    );
    const poolScript = new PoolPoolSpend(
      poolManageScript.Script.asPlutusV3()!.hash(),
      Core.PolicyId(this.settingsPolicyId),
    );
    const stakeScript = new StakeStakeElse(
      poolScript.Script.asPlutusV3()!.hash(),
    );
    const orderScript = new OrderOrderSpend(
      stakeScript.Script.asPlutusV3()!.hash(),
    );
    const baseProtocolParams =
      await this.queryProvider.getProtocolParamsWithScripts(
        EContractVersion.V3,
      );
    const protocolParams: ISundaeProtocolParamsFull = {
      version: this.contractVersion,
      blueprint: {
        validators: baseProtocolParams.blueprint.validators.map((validator) => {
          switch (validator.title) {
            case "order.spend": {
              return {
                ...validator,
                compiledCode: orderScript.Script.asPlutusV3()!.rawBytes(),
                hash: orderScript.Script.asPlutusV3()!.hash(),
              };
            }
            case "pool.spend":
            case "pool.mint": {
              return {
                ...validator,
                compiledCode: poolScript.Script.asPlutusV3()!.rawBytes(),
                hash: poolScript.Script.asPlutusV3()!.hash(),
              };
            }
            case "pool_stake.stake": {
              return {
                ...validator,
                compiledCode: poolManageScript.Script.asPlutusV3()!.rawBytes(),
                hash: poolManageScript.Script.asPlutusV3()!.hash(),
              };
            }
            default:
              return validator;
          }
        }),
      },
      references: baseProtocolParams.references
        .map((reference) => {
          switch (reference.key) {
            case "order.spend":
            case "pool.spend":
            case "pool.mint":
            case "pool_stake.stake":
              return undefined;
            default:
              return reference;
          }
        })
        .filter((ref) => ref !== undefined),
    };
    return protocolParams;
  }
}
