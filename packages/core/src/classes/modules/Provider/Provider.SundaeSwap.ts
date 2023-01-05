import { providerBaseUrls } from "../../../lib/params";
import { TSupportedNetworks } from "../../../types";
import { IPoolData, Provider } from "./Provider.abstract.class";

export class ProviderSundaeSwap extends Provider {
  protected baseUrl: string;

  constructor(protected network: TSupportedNetworks) {
    super();
    this.network = network;
    this.baseUrl = providerBaseUrls[network];
  }

  async findPoolIdent(
    tickerA: string,
    tickerB: string,
    fee: string
  ): Promise<string> {
    const data = await this.findPoolData(tickerA, tickerB, fee);
    if (!data.ident) {
      throw new Error("Unable to find matching ident for that pair!");
    }

    return data.ident;
  }

  async findPoolData(
    tickerA: string,
    tickerB: string,
    fee: string
  ): Promise<IPoolData> {
    const res: {
      data?: {
        poolsByPair: IPoolData[];
      };
    } = await fetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify({
        query: `
          query poolsByPair($tickerA: String!, $tickerB: String!) {
              poolsByPair(coinA: $tickerA, coinB: $tickerB) {
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
          tickerA,
          tickerB,
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
