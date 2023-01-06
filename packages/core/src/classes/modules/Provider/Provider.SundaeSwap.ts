import { providerBaseUrls } from "../../../lib/params";
import { TSupportedNetworks } from "../../../types";
import { IPoolData, IPoolQuery, Provider } from "./Provider.abstract.class";

export class ProviderSundaeSwap extends Provider {
  protected baseUrl: string;

  constructor(protected network: TSupportedNetworks) {
    super();
    this.network = network;
    this.baseUrl = providerBaseUrls[network];
  }

  async findPoolIdent(query: IPoolQuery): Promise<string> {
    const data = await this.findPoolData(query);
    if (!data.ident) {
      throw new Error("Unable to find matching ident for that pair!");
    }

    return data.ident;
  }

  async findPoolData({
    pair: [coinA, coinB],
    fee,
  }: IPoolQuery): Promise<IPoolData> {
    const res: {
      data?: {
        poolsByPair: IPoolData[];
      };
    } = await fetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify({
        query: `
          query poolsByPair($coinA: String!, $coinB: String!) {
              poolsByPair(coinA: $coinA, coinB: $coinB) {
                fee
                ident
                assetA {
                  assetId
                  decimals
                }
                assetB {
                  assetId
                  decimals
                }
              }
          }
        `,
        variables: {
          coinA,
          coinB,
        },
      }),
    }).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        "Something went wrong when trying to fetch pool data. Full response: " +
          JSON.stringify(res)
      );
    }

    const pool = res.data.poolsByPair.find(
      ({ fee: poolFee }) => poolFee === fee
    );

    if (!pool) {
      throw new Error("Pool ident not found with a fee of: " + fee);
    }

    return pool;
  }
}
