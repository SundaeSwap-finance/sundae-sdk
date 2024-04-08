import request from "graphql-request";
import {
  Credential,
  Delegation,
  OutRef,
  ProtocolParameters,
  Provider,
  UTxO,
} from "lucid-cardano";
import { GetUtxosQuery } from "./queries";

export class GummiProvider implements Provider {
  constructor(public endpoint: string) {}

  getDatum(datumHash: string): Promise<string> {}

  awaitTx(
    txHash: string,
    checkInterval?: number | undefined
  ): Promise<boolean> {}

  getDelegation(rewardAddress: string): Promise<Delegation> {}

  getProtocolParameters(): Promise<ProtocolParameters> {}

  getUtxoByUnit(unit: string): Promise<UTxO> {}

  async getUtxos(addressOrCredential: string | Credential): Promise<UTxO[]> {
    return await request<UTxO[]>(this.endpoint, GetUtxosQuery);
  }

  getUtxosByOutRef(outRefs: OutRef[]): Promise<UTxO[]> {}

  getUtxosWithUnit(
    addressOrCredential: string | Credential,
    unit: string
  ): Promise<UTxO[]> {}

  submitTx(tx: string): Promise<string> {}
}
