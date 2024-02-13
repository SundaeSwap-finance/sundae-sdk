import { TUTXO } from "../@types/datumbuilder.js";
import { IPoolData, IPoolDataAsset } from "../@types/queryprovider.js";
import { EContractVersion } from "../@types/txbuilders.js";
import { TSupportedNetworks } from "../@types/utilities.js";
import { QueryProvider } from "../Abstracts/QueryProvider.abstract.class.js";

const providerBaseUrls: Record<TSupportedNetworks, string> = {
  mainnet: "https://api.stats.sundaeswap.finance/graphql",
  preview: "https://api.stats.preview.sundaeswap.finance/graphql",
};

interface IPoolDataQueryResult {
  /** The pool fee. */
  fee: string;
  /** The unique identifier of the pool. */
  ident: string;
  /** Asset data for the pool pair, Asset A */
  assetA: IPoolDataAsset;
  /** Asset data for the pool pair, Asset B */
  assetB: IPoolDataAsset;
  /** Asset data for the pool pair, AssetLP */
  assetLP: IPoolDataAsset;
  /** The pool quantity of {@link assetA} */
  quantityA: string;
  /** The pool quantity of {@link assetB} */
  quantityB: string;
  /** The pool quantity of {@link assetLP} */
  quantityLP: string;
  /** The pool version */
  version: EContractVersion;
}

/**
 * Legacy query interface for the legacy API.
 */
export interface IPoolQueryLegacy {
  /** The pool pair, as an array of {@link IPoolDataAsset.assetId} */
  pair: [string, string];
  /** The desired pool fee as a percentage string. */
  fee: string;
  /** Narrow the results even more if you want to get by ident. */
  ident?: string;
}

/**
 * This class provides a simple set of useful tooling, but primarily is used to
 * query data about pools on the SundaeSwap protocol.
 *
 * @example
 * ```ts
 * const query = new QueryProviderSundaeSwapLegacy("preview");
 * const { ident } = await query.findPoolData({
 *   pair: [assetAId, assetBId],
 *   fee: "0.03"
 * });
 *
 * console.log(ident); // "02"
 * ```
 *
 * @group Extensions
 */
export class QueryProviderSundaeSwapLegacy implements QueryProvider {
  baseUrl: string;

  constructor(protected network: TSupportedNetworks) {
    this.baseUrl = providerBaseUrls[network];
  }

  async findPoolData({
    pair: [coinA, coinB],
    fee,
    ident,
  }: IPoolQueryLegacy): Promise<IPoolData> {
    const res: {
      data?: {
        poolsByPair: IPoolDataQueryResult[];
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
                    assetLP {
                      assetId
                      decimals
                    }
                    quantityA
                    quantityB
                    quantityLP
                    version
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
        `Something went wrong when trying to fetch pool data. Full response: ${JSON.stringify(
          res
        )}`
      );
    }

    const pool = res.data.poolsByPair.find(
      ({ fee: poolFee, ident: poolIdent }) => {
        if (ident) {
          return ident === poolIdent;
        }

        return fee === poolFee;
      }
    );

    if (!pool) {
      throw new Error(`Pool ident not found with a fee of: ${fee}`);
    }

    return {
      assetA: pool.assetA,
      assetB: pool.assetB,
      assetLP: pool.assetLP,
      ident: pool.ident,
      // The API does not conform to the proper decimals, lol
      currentFee: Number(pool.fee) / 100,
      liquidity: {
        aReserve: BigInt(pool.quantityA ?? 0),
        bReserve: BigInt(pool.quantityB ?? 0),
        lpTotal: BigInt(pool.quantityLP ?? 0),
      },
      version: pool.version,
    };
  }

  async findOpenOrderDatum(utxo: TUTXO) {
    const res: {
      data?: {
        utxo: {
          datum: string;
          datumHash: string;
        };
      };
    } = await fetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify({
        query: `
            query UTXO($txHash: String!, $index: Int!) {
              utxo(txHash: $txHash, index: $index) {
                datum
                datumHash
              }
            }
            `,
        variables: {
          txHash: utxo.hash,
          index: utxo.index,
        },
      }),
    }).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch that transaction's datum. Full response: ${JSON.stringify(
          res
        )}`
      );
    }

    return {
      datum: Buffer.from(res.data.utxo.datum, "base64").toString("hex"),
      datumHash: res.data.utxo.datumHash,
    };
  }
}
