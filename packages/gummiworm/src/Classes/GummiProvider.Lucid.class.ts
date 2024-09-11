import {
  Assets,
  Credential,
  Delegation,
  Lucid,
  Network,
  OutRef,
  PROTOCOL_PARAMETERS_DEFAULT,
  ProtocolParameters,
  Provider,
  UTxO,
} from "lucid-cardano";

import { IGummiWormUtxos } from "../@types/api";
import { GUMMIWORM_PROTOCOL_PARAMS } from "../constants/gummiworm.js";

export class GummiProvider implements Provider {
  public url: string;

  constructor(public network: Network) {
    switch (network) {
      default:
      case "Preview":
        this.url = "https://api.gummiworm.preview.sundae.fi";
        break;
      case "Mainnet":
        this.url = "https://api.gummiworm.sundae.fi";
        break;
    }
  }

  async awaitTx(
    txHash: string,
    checkInterval?: number | undefined,
  ): Promise<boolean> {
    console.log(txHash, checkInterval);
    console.log("called awaitTx");

    return true;
  }

  async getDatum(_datumHash: string): Promise<string> {
    console.log("called datum");

    return "";
  }

  async getDelegation(_rewardAddress: string): Promise<Delegation> {
    console.log("called delegation");
    return {
      poolId: "",
      rewards: 0n,
    };
  }

  async getProtocolParameters(): Promise<ProtocolParameters> {
    return {
      minFeeA: 0,
      minFeeB: 0,
      maxTxSize: GUMMIWORM_PROTOCOL_PARAMS.maxTxSize,
      maxValSize: GUMMIWORM_PROTOCOL_PARAMS.maxValueSize,
      keyDeposit: BigInt(GUMMIWORM_PROTOCOL_PARAMS.stakeAddressDeposit),
      poolDeposit: BigInt(GUMMIWORM_PROTOCOL_PARAMS.stakePoolDeposit),
      priceMem: GUMMIWORM_PROTOCOL_PARAMS.executionUnitPrices.priceMemory,
      priceStep: GUMMIWORM_PROTOCOL_PARAMS.executionUnitPrices.priceSteps,
      maxTxExMem: BigInt(GUMMIWORM_PROTOCOL_PARAMS.maxTxExecutionUnits.memory),
      maxTxExSteps: BigInt(GUMMIWORM_PROTOCOL_PARAMS.maxTxExecutionUnits.steps),
      coinsPerUtxoByte: BigInt(GUMMIWORM_PROTOCOL_PARAMS.utxoCostPerByte),
      collateralPercentage: GUMMIWORM_PROTOCOL_PARAMS.collateralPercentage,
      maxCollateralInputs: GUMMIWORM_PROTOCOL_PARAMS.maxCollateralInputs,
      costModels: {
        PlutusV1: PROTOCOL_PARAMETERS_DEFAULT.costModels.PlutusV1,
        PlutusV2: PROTOCOL_PARAMETERS_DEFAULT.costModels.PlutusV2,
      },
      // minfeeRefscriptCostPerByte:
      //   PROTOCOL_PARAMETERS_DEFAULT.minfeeRefscriptCostPerByte,
    };
  }

  async getUtxos(addressOrCredential: string | Credential): Promise<UTxO[]> {
    const lucid = await Lucid.new(undefined, this.network);
    const address =
      typeof addressOrCredential === "string"
        ? addressOrCredential
        : lucid.utils.credentialToAddress(addressOrCredential);
    const response = await fetch(
      `${this.url}/get_utxos?address=${address}`,
    ).then((res) => res.json());

    return this.__transformRestUtxos(response);
  }

  async getUtxoByUnit(_unit: string): Promise<UTxO> {
    console.log("called utxoByUnit");

    return {
      address: "",
      assets: {},
      outputIndex: 0,
      txHash: "",
    };
  }

  async getUtxosByOutRef(_outRefs: OutRef[]): Promise<UTxO[]> {
    console.log("called utxosByOutRef");
    return [
      {
        address: "",
        assets: {},
        outputIndex: 0,
        txHash: "",
      },
    ];
  }

  async getUtxosWithUnit(): Promise<UTxO[]> {
    console.log("called utxosWithUnit");
    return [
      {
        address: "",
        assets: {},
        outputIndex: 0,
        txHash: "",
      },
    ];
  }

  async submitTx(txCbor: string): Promise<string> {
    await fetch(`${this.url}/submit_tx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        txCbor,
      }),
    });

    return "";
  }

  /**
   * Transforms details as needed.
   *
   * @param {IGummiWormUtxos} response The raw API response from the gummiworm api endpoint.
   * @returns
   */
  private __transformRestUtxos(response: IGummiWormUtxos): UTxO[] {
    return Object.entries(response).map(([txData, { value, ...rest }]) => {
      const assets = this.__convertValueToAssets(value);
      const [txHash, outputIndex] = txData.split("#");

      return {
        ...rest,
        assets,
        outputIndex: Number(outputIndex),
        txHash,
      };
    });
  }

  /**
   * Converts the API response object structure to an Assets structure.
   *
   * @param {any} input An asset map of utxo assets.
   * @returns {Assets}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private __convertValueToAssets(input: any): Assets {
    const newValue: Assets = {};

    for (const [key, value] of Object.entries<number | Record<string, number>>(
      input,
    )) {
      if (typeof value === "number") {
        newValue[key] = BigInt(value);
      } else if (typeof value === "object" && value !== null) {
        for (const [assetName, amount] of Object.entries<number>(value)) {
          newValue[key + assetName] = BigInt(amount);
        }
      }
    }

    return newValue;
  }
}
