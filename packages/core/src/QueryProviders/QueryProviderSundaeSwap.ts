import {
  EContractVersion,
  IPoolByIdentQuery,
  IPoolData,
  IPoolDataAsset,
  ISundaeProtocolParams,
  ISundaeProtocolParamsFull,
  TFee,
  TSupportedNetworks,
  TUTXO,
} from "../@types/index.js";
import { QueryProvider } from "../Abstracts/QueryProvider.abstract.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";

const providerBaseUrls: Record<TSupportedNetworks, string> = {
  mainnet: "https://api.sundae.fi/graphql",
  preview: "https://api.preview.sundae.fi/graphql",
};

interface IPoolDataQueryResult {
  feesFinalized: {
    /** The slot when the fee amount is finalized. */
    slot: string;
  };
  marketOpen: {
    /** The slot when the pool is open for trading. */
    slot: string;
  };
  /** The fee amount when the pool opens. */
  openingFee: TFee;
  /** The fee amount when the decay is finalized. */
  finalFee: TFee;
  /** The unique pool identifier. */
  id: string;
  assetA: IPoolDataAsset;
  assetB: IPoolDataAsset;
  assetLP: IPoolDataAsset;
  current: {
    quantityA: {
      /** The amount of assetA in the protocol. */
      quantity: string;
    };
    quantityB: {
      /** The amount of assetB in the protocol. */
      quantity: string;
    };
    quantityLP: {
      /** The amount of assetLP in the protocol. */
      quantity: string;
    };
  };
  version: EContractVersion;
}

/**
 * This class provides a simple set of useful tooling, but primarily is used to
 * query data about pools on the SundaeSwap protocol.
 *
 * @example
 * ```ts
 * const query = new QueryProviderSundaeSwap("preview");
 * const { ident } = await query.findPoolData({
 *   ident: "02"
 * });
 *
 * console.log(ident); // "02"
 * ```
 *
 * @group Extensions
 */
export class QueryProviderSundaeSwap implements QueryProvider {
  public baseUrl: string;

  constructor(protected network: TSupportedNetworks) {
    this.baseUrl = providerBaseUrls[network];
  }

  async findPoolData({ ident }: IPoolByIdentQuery): Promise<IPoolData> {
    const res: {
      data?: {
        pools: {
          byId: IPoolDataQueryResult;
        };
      };
    } = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query poolByIdent($id: ID!) {
            pools {
              byId(id: $id) {
                feesFinalized {
                  slot
                }
                marketOpen {
                  slot
                }
                openingFee
                finalFee
                id
                assetA {
                  assetId: id
                  decimals
                }
                assetB {
                  assetId: id
                  decimals
                }
                assetLP {
                  assetId: id
                  decimals
                }
                current {
                  quantityA {
                    quantity
                  }
                  quantityB {
                    quantity
                  }
                  quantityLP {
                    quantity
                  }
                }
                version
              }
            }
          }
        `,
        variables: {
          id: ident,
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

    const pool = res.data.pools.byId;

    return {
      assetA: pool.assetA,
      assetB: pool.assetB,
      assetLP: pool.assetLP,
      currentFee: SundaeUtils.getCurrentFeeFromDecayingFee({
        endFee: pool.finalFee,
        endSlot: pool.feesFinalized.slot,
        startFee: pool.openingFee,
        startSlot: pool.marketOpen.slot,
        network: this.network,
      }),
      ident: pool.id,
      liquidity: {
        aReserve: BigInt(pool.current.quantityA.quantity ?? 0),
        bReserve: BigInt(pool.current.quantityB.quantity ?? 0),
        lpTotal: BigInt(pool.current.quantityLP.quantity ?? 0),
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

  /**
   * Retrieves the script hashes for all available Protocols.
   *
   * @param {EContractVersion} version The protocol script hashes.
   */
  async getProtocolParamsWithScriptHashes(
    version: undefined
  ): Promise<ISundaeProtocolParams[]>;
  async getProtocolParamsWithScriptHashes(
    version: EContractVersion
  ): Promise<ISundaeProtocolParams>;
  async getProtocolParamsWithScriptHashes(
    version?: EContractVersion
  ): Promise<ISundaeProtocolParams[] | ISundaeProtocolParams> {
    const res: {
      data?: { protocols: ISundaeProtocolParams[] };
    } = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query ProtocolValidators {
          protocols {
            blueprint {
              validators {
                hash
                title
              }
            }
            references {
              key
              txIn {
                hash
                index
              }
            }
            version
          }
        }
        `,
      }),
    }).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch the protocol validators. Full response: ${JSON.stringify(
          res
        )}`
      );
    }

    if (version) {
      return res.data.protocols.find(
        ({ version: protocolVersion }) => version === protocolVersion
      ) as ISundaeProtocolParams;
    }

    return res.data.protocols;
  }

  /**
   * Retrieves the script hashes for all available Protocols.
   *
   * @param {EContractVersion} version The protocol script hashes.
   */
  async getProtocolParamsWithScripts(
    version: undefined
  ): Promise<ISundaeProtocolParamsFull[]>;
  async getProtocolParamsWithScripts(
    version: EContractVersion
  ): Promise<ISundaeProtocolParamsFull>;
  async getProtocolParamsWithScripts(
    version?: EContractVersion
  ): Promise<ISundaeProtocolParamsFull[] | ISundaeProtocolParamsFull> {
    const res: {
      data?: { protocols: ISundaeProtocolParamsFull[] };
    } = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query ProtocolValidators {
          protocols {
            blueprint {
              validators {
                hash
                title
                compiledCode
              }
            }
            references {
              key
              txIn {
                hash
                index
              }
            }
            version
          }
        }
        `,
      }),
    }).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch the protocol validators. Full response: ${JSON.stringify(
          res
        )}`
      );
    }

    if (version) {
      return res.data.protocols.find(
        ({ version: protocolVersion }) => version === protocolVersion
      ) as ISundaeProtocolParamsFull;
    }

    return res.data.protocols;
  }
}
