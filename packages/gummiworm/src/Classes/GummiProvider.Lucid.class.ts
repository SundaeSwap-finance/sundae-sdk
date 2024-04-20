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

export class GummiProvider implements Provider {
  public url: string;

  constructor(public network: Network | "Local") {
    switch (network) {
      default:
      case "Local":
        this.url = "https://api.gummiworm.preview.sundae.fi";
        break;
      case "Preview":
        this.url = "https://api.gummiworm.preview.sundae.fi";
        break;
      case "Mainnet":
        this.url = "";
        break;
    }
  }

  async awaitTx(
    txHash: string,
    checkInterval?: number | undefined
  ): Promise<boolean> {
    console.log(txHash, checkInterval);
    // const query = `
    //   query {
    //     confirmTx(hash: $hash)
    //   }
    // `

    return true;
  }

  async getDatum(datumHash: string): Promise<string> {
    console.log(datumHash);
    // const query = `
    //   query {
    //     getDatum(txHash: $txHash)
    //   }
    // `

    return "";
  }

  async getDelegation(rewardAddress: string): Promise<Delegation> {
    console.log(rewardAddress);
    return {
      poolId: "",
      rewards: 0n,
    };
  }

  async getProtocolParameters(): Promise<ProtocolParameters> {
    return PROTOCOL_PARAMETERS_DEFAULT;
  }

  async getUtxos(addressOrCredential: string | Credential): Promise<UTxO[]> {
    const lucid = await Lucid.new(
      undefined,
      this.network === "Local" ? "Preview" : this.network
    );
    const address =
      typeof addressOrCredential === "string"
        ? addressOrCredential
        : lucid.utils.credentialToAddress(addressOrCredential);
    const response = await fetch(
      `${this.url}/get_utxos?address=${address}`
    ).then((res) => res.json());

    return this.__transformRestUtxos(response);
  }

  async getUtxoByUnit(unit: string): Promise<UTxO> {
    // const query = `
    //   query {
    //     getUtxosByUnit(assetId: $assetId) {
    //       ...
    //     }
    //   }
    // `
    console.log(unit);

    return {
      address: "",
      assets: {},
      outputIndex: 0,
      txHash: "",
    };
  }

  async getUtxosByOutRef(outRefs: OutRef[]): Promise<UTxO[]> {
    console.log(outRefs);
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
    return [
      {
        address: "",
        assets: {},
        outputIndex: 0,
        txHash: "",
      },
    ];
  }

  async submitTx(tx: string): Promise<string> {
    console.log(tx);
    return "";
  }

  private __transformRestUtxos(response: IGummiWormUtxos): UTxO[] {
    return Object.values(response).map(({ value, ...rest }) => {
      const transformedValue: Assets = {};
      for (let [id, amt] of Object.entries(value)) {
        transformedValue[id] = BigInt(amt);
      }

      return {
        ...rest,
        assets: transformedValue,
        // @todo update
        outputIndex: 0,
        txHash: "",
      };
    });
  }
}
