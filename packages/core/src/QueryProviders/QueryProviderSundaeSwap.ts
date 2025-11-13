import { Fraction } from "@sundaeswap/fraction";
import {
  EContractVersion,
  IPoolByAssetQuery,
  IPoolByIdentQuery,
  IPoolByPairQuery,
  IPoolBySearchTermQuery,
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

export type TFindPoolDataArgs =
  | IPoolByIdentQuery
  | IPoolByAssetQuery
  | IPoolBySearchTermQuery
  | IPoolByPairQuery;

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
  protocolAskFee: TFee;
  linearAmplificationFactor: string;
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
  private protocolParamsFull: ISundaeProtocolParamsFull[] = [];
  private protocolParams: ISundaeProtocolParams[] = [];
  private poolData: Map<string, IPoolData>;

  constructor(protected network: TSupportedNetworks) {
    this.baseUrl = providerBaseUrls[network];
    this.poolData = new Map();
  }

  addCustomProtocolParams(protocolParamsFull: ISundaeProtocolParamsFull): void {
    this.protocolParamsFull = [protocolParamsFull, ...this.protocolParamsFull];
    const protocolParams = {
      ...protocolParamsFull,
      blueprint: {
        ...protocolParamsFull.blueprint,
        validators: protocolParamsFull.blueprint.validators.map(
          (validator) => ({ ...validator, compiledCode: undefined }),
        ),
      },
    };
    this.protocolParams = [protocolParams, ...this.protocolParams];
  }

  setPoolData(ident: string, poolData: IPoolData) {
    this.poolData.set(ident, poolData);
  }

  async findPoolDataByAssetPair(
    assetA: string,
    assetB: string,
    minimal: boolean = false,
  ): Promise<IPoolData[]> {
    const query = minimal
      ? `
        query poolByPair($assetA: ID!, $assetB: ID!) {
          pools {
            byPair(assetA: $assetA, assetB: $assetB) {
              id
              assetA {
                assetId: id
              }
              assetB {
                assetId: id
              }
              assetLP {
                assetId: id
              }
              finalFee
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
              linearAmplificationFactor
              protocolAskFee
              version
            }
          }
        }
      `
      : `
      query poolByPair($assetA: ID!, $assetB: ID!) {
        pools {
          byPair(assetA: $assetA, assetB: $assetB) {
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
              linearAmplificationFactor
              protocolAskFee
              version
            }
          }
        }
      `;
    const res: { data?: { pools: { byPair: IPoolDataQueryResult[] } } } =
      await (
        await fetch(this.baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { assetA: assetA, assetB: assetB },
          }),
        })
      ).json();

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch pool data. Full response: ${JSON.stringify(
          res,
        )}`,
      );
    }

    const pools = res.data.pools.byPair;

    return pools.map((pool) => {
      return {
        assetA: pool.assetA,
        assetB: pool.assetB,
        assetLP: pool.assetLP,
        currentFee: minimal
          ? new Fraction(...pool.finalFee).toNumber()
          : SundaeUtils.getCurrentFeeFromDecayingFee({
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
        linearAmplificationFactor: BigInt(pool.linearAmplificationFactor),
        protocolFee: new Fraction(...pool.protocolAskFee).toNumber(),
        version: pool.version,
      };
    });
  }

  async findPoolDataByAssetId(
    assetId: string,
    minimal: boolean = false,
  ): Promise<IPoolData[]> {
    const query = minimal
      ? `
        query poolByIdent($assetId: ID!) {
          pools {
            byAsset(asset: $assetId) {
              id
              assetA {
                assetId: id
              }
              assetB {
                assetId: id
              }
              assetLP {
                assetId: id
              }
              finalFee
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
              linearAmplificationFactor
              protocolAskFee
              version
            }
          }
        }
      `
      : `
        query poolByIdent($assetId: ID!) {
          pools {
            byAsset(asset: $assetId) {
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
              linearAmplificationFactor
              protocolAskFee
              version
            }
          }
        }
      `;
    const res: { data?: { pools: { byAsset: IPoolDataQueryResult[] } } } =
      await (
        await fetch(this.baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { assetId: assetId },
          }),
        })
      ).json();

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch pool data. Full response: ${JSON.stringify(
          res,
        )}`,
      );
    }

    const pools = res.data.pools.byAsset;

    return pools.map((pool) => {
      return {
        assetA: pool.assetA,
        assetB: pool.assetB,
        assetLP: pool.assetLP,
        currentFee: minimal
          ? new Fraction(...pool.finalFee).toNumber()
          : SundaeUtils.getCurrentFeeFromDecayingFee({
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
        linearAmplificationFactor: BigInt(pool.linearAmplificationFactor),
        protocolFee: new Fraction(...pool.protocolAskFee).toNumber(),
        version: pool.version,
      };
    });
  }

  async findPoolDataBySearchTerm(
    search: string,
    minimal: boolean = false,
  ): Promise<IPoolData[]> {
    const query = minimal
      ? `
        query queryPoolByTerm($term: String!) {
          pools {
            search(term: $term) {
              id
              assetA {
                assetId: id
              }
              assetB {
                assetId: id
              }
              assetLP {
                assetId: id
              }
              finalFee
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
              linearAmplificationFactor
              protocolAskFee
              version
            }
          }
        }
      `
      : `
        query poolByTerm($term: String!) {
          pools {
            search(term: $term) {
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
              linearAmplificationFactor
              protocolAskFee
              version
            }
          }
        }
      `;
    const res: { data?: { pools: { search: IPoolDataQueryResult[] } } } =
      await (
        await fetch(this.baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { term: search },
          }),
        })
      ).json();

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch pool data. Full response: ${JSON.stringify(
          res,
        )}`,
      );
    }

    const pools = res.data.pools.search;

    return pools.map((pool) => {
      return {
        assetA: pool.assetA,
        assetB: pool.assetB,
        assetLP: pool.assetLP,
        currentFee: minimal
          ? new Fraction(...pool.finalFee).toNumber()
          : SundaeUtils.getCurrentFeeFromDecayingFee({
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
        linearAmplificationFactor: BigInt(pool.linearAmplificationFactor),
        protocolFee: new Fraction(...pool.protocolAskFee).toNumber(),
        version: pool.version,
      };
    });
  }

  async findPoolData(identArgs: IPoolByIdentQuery): Promise<IPoolData>;
  async findPoolData(assetArgs: IPoolByAssetQuery): Promise<IPoolData[]>;
  async findPoolData(assetPairArgs: IPoolByPairQuery): Promise<IPoolData[]>;
  async findPoolData(searchArgs: IPoolBySearchTermQuery): Promise<IPoolData[]>;
  async findPoolData(
    args: TFindPoolDataArgs,
  ): Promise<IPoolData | IPoolData[]> {
    if ("search" in args) {
      return this.findPoolDataBySearchTerm(args.search, args.minimal);
    }
    if ("assetId" in args) {
      return this.findPoolDataByAssetId(args.assetId, args.minimal);
    }
    if ("pair" in args) {
      return this.findPoolDataByAssetPair(args.pair[0], args.pair[1], false);
    }
    return this.findPoolDataByIdent(args);
  }

  async findPoolDataByIdent({ ident }: IPoolByIdentQuery): Promise<IPoolData> {
    if (this.poolData.has(ident)) {
      return this.poolData.get(ident) as IPoolData;
    }
    const res: { data?: { pools: { byId: IPoolDataQueryResult } } } =
      await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
                linearAmplificationFactor
                protocolAskFee
                version
              }
            }
          }
        `,
          variables: { id: ident },
        }),
      }).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch pool data. Full response: ${JSON.stringify(
          res,
        )}`,
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
      linearAmplificationFactor: BigInt(pool.linearAmplificationFactor),
      protocolFee: new Fraction(...pool.protocolAskFee).toNumber(),
      version: pool.version,
    };
  }

  async findOpenOrderDatum(utxo: TUTXO) {
    const res: { data?: { utxo: { datum: string; datumHash: string } } } =
      await fetch(this.baseUrl, {
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
          variables: { txHash: utxo.hash, index: utxo.index },
        }),
      }).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch that transaction's datum. Full response: ${JSON.stringify(
          res,
        )}`,
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
    version: undefined,
  ): Promise<ISundaeProtocolParams[]>;
  async getProtocolParamsWithScriptHashes(
    version: EContractVersion,
  ): Promise<ISundaeProtocolParams>;
  async getProtocolParamsWithScriptHashes(
    version?: EContractVersion,
  ): Promise<ISundaeProtocolParams[] | ISundaeProtocolParams> {
    const res: { data?: { protocols: ISundaeProtocolParams[] } } = await fetch(
      this.baseUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      },
    ).then((res) => res.json());

    if (!res?.data) {
      throw new Error(
        `Something went wrong when trying to fetch the protocol validators. Full response: ${JSON.stringify(
          res,
        )}`,
      );
    }

    res.data.protocols = this.protocolParams.concat(res.data.protocols);

    if (version) {
      return res.data.protocols.find(
        ({ version: protocolVersion }) => version === protocolVersion,
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
    version: undefined,
  ): Promise<ISundaeProtocolParamsFull[]>;
  async getProtocolParamsWithScripts(
    version: EContractVersion,
  ): Promise<ISundaeProtocolParamsFull>;
  async getProtocolParamsWithScripts(
    version?: EContractVersion,
  ): Promise<ISundaeProtocolParamsFull[] | ISundaeProtocolParamsFull> {
    const res: { data?: { protocols: ISundaeProtocolParamsFull[] } } =
      await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          res,
        )}`,
      );
    }

    res.data.protocols = this.protocolParamsFull.concat(res.data.protocols);

    if (version) {
      return res.data.protocols.find(
        ({ version: protocolVersion }) => version === protocolVersion,
      ) as ISundaeProtocolParamsFull;
    }

    return res.data.protocols;
  }
}
