import {
  IPoolData,
  IPoolQuery,
  IQueryProviderClass,
  TSupportedNetworks,
} from "../../../@types";
import { providerBaseUrls } from "../../../lib/params";

/**
 * This class provides a simple set of useful tooling, but primarily is used to
 * query data about pools on the SundaeSwap protocol.
 *
 * @example
 * ```ts
 * const query = new QueryProviderSundaeSwap("preview");
 * const ident = await query.findPoolIdent({
 *   pair: ["assetIdA", "assetIdB"],
 *   fee: "0.03"
 * });
 *
 * console.log(ident); // "00"
 * ```
 *
 * @group Extensions
 */
export class QueryProviderSundaeSwap implements IQueryProviderClass {
  protected baseUrl: string;

  constructor(protected network: TSupportedNetworks) {
    this.network = network;
    this.baseUrl = providerBaseUrls[network];
  }

  async findPoolIdent(query: IPoolQuery) {
    const data = await this.findPoolData(query);
    if (!data.ident) {
      throw new Error("Unable to find matching ident for that pair!");
    }

    return data.ident;
  }

  async findPoolData({ pair: [coinA, coinB], fee }: IPoolQuery) {
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
                quantityA
                quantityB
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
