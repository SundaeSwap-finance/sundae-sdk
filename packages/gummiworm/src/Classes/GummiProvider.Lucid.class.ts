import {
  Credential,
  Delegation,
  OutRef,
  PROTOCOL_PARAMETERS_DEFAULT,
  ProtocolParameters,
  Provider,
  UTxO,
} from "lucid-cardano";

export class GummiProvider implements Provider {
  constructor(public endpoint: string) {}

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
    // return await request<UTxO[]>(this.endpoint, GetUtxosQuery, {
    //   variables: {
    //     address: addressOrCredential,
    //   },
    // });
    console.log(addressOrCredential);

    return [];
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
}
