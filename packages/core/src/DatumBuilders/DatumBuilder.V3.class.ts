import { Core, Data } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { sqrt } from "@sundaeswap/bigint-math";

import {
  EDatumType,
  EDestinationType,
  IFeesConfig,
  TDatumResult,
  TDestination,
  TDestinationAddress,
  TSupportedNetworks,
} from "../@types/index.js";
import { DatumBuilderAbstract } from "../Abstracts/DatumBuilder.abstract.class.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import * as V3Types from "./ContractTypes/Contract.v3.js";

/**
 * The base arguments for the V3 DatumBuilder.
 */
export interface IDatumBuilderBaseV3Args {
  destinationAddress: TDestinationAddress;
  ident: string;
  ownerAddress?: string;
  scooperFee: bigint;
}

/**
 * The arguments from building a swap transaction against
 * a V3 pool contract.
 */
export interface IDatumBuilderSwapV3Args extends IDatumBuilderBaseV3Args {
  order: {
    minReceived: AssetAmount<IAssetAmountMetadata>;
    offered: AssetAmount<IAssetAmountMetadata>;
  };
}

/**
 * The arguments from building a withdraw transaction against
 * a V3 pool contract.
 */
export interface IDatumBuilderDepositV3Args extends IDatumBuilderBaseV3Args {
  order: {
    assetA: AssetAmount<IAssetAmountMetadata>;
    assetB: AssetAmount<IAssetAmountMetadata>;
  };
}

/**
 * The arguments for building a withdraw transaction against
 * a V3 pool contract.
 */
export interface IDatumBuilderWithdrawV3Args extends IDatumBuilderBaseV3Args {
  order: {
    lpToken: AssetAmount<IAssetAmountMetadata>;
  };
}

/**
 * The arguments for building a strategy transaction against a V3 pool contract.
 */
export interface IDatumBuilderStrategyV3Args
  extends Omit<IDatumBuilderBaseV3Args, "destinationAddress"> {
  destination: TDestination;
  ownerAddress: string;
  order: {
    signer?: string;
    script?: string;
  };
}

/**
 * The arguments for building a minting a new pool transaction against
 * the V3 pool contract.
 */
export interface IDatumBuilderMintPoolV3Args {
  seedUtxo: { txHash: string; outputIndex: number };
  assetA: AssetAmount<IAssetAmountMetadata>;
  assetB: AssetAmount<IAssetAmountMetadata>;
  fees: IFeesConfig;
  depositFee: bigint;
  marketOpen?: bigint;
}

/**
 * The arguments for building a minting a new pool transaction against
 * the V3 pool contract, specifically to be associated with the
 * newly minted assets, such as liquidity tokens.
 */
export interface IDatumBuilderPoolMintRedeemerV3Args {
  assetB: AssetAmount<IAssetAmountMetadata>;
  assetA: AssetAmount<IAssetAmountMetadata>;
  poolOutput: bigint;
  metadataOutput: bigint;
}

/**
 * This class is useful if you would rather just build valid CBOR strings for just the datum
 * portion of a valid SundaeSwap transaction.
 */
export class DatumBuilderV3 implements DatumBuilderAbstract {
  /** The current network id. */
  public network: TSupportedNetworks;
  /** The error to throw when the pool ident does not match V1 constraints. */
  static INVALID_POOL_IDENT =
    "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";

  constructor(network: TSupportedNetworks) {
    this.network = network;
  }

  /**
   * Constructs a swap datum object tailored for V3 swaps, based on the provided arguments. This function
   * assembles a detailed swap datum structure, which includes the pool ident, destination address, owner information,
   * scooper fee, and the swap order details. The swap order encapsulates the offered asset and the minimum received
   * asset requirements. The constructed datum is then converted to an inline format suitable for transaction embedding,
   * and its hash is computed. The function returns an object containing the hash, the inline datum, and the original
   * datum schema, facilitating the swap operation within a transactional context.
   *
   * @param {IDatumBuilderSwapV3Args} args - The swap arguments for constructing the V3 swap datum.
   * @returns {TDatumResult<V3Types.TOrderDatum>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original swap datum, essential for the execution of the swap operation.
   */
  public buildSwapDatum({
    destinationAddress,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderSwapV3Args): TDatumResult<V3Types.TOrderDatum> {
    const datum: V3Types.TOrderDatum = {
      poolIdent: this.validatePoolIdent(ident),
      destination: this.buildDestinationAddresses(destinationAddress).schema,
      owner: this.buildOwnerDatum(ownerAddress ?? destinationAddress.address)
        .schema,
      scooperFee: scooperFee,
      order: {
        Swap: {
          offer: this.buildAssetAmountDatum(order.offered).schema,
          minReceived: this.buildAssetAmountDatum(order.minReceived).schema,
        },
      },
      extension: Data.void().toCbor(),
    };

    const data = Data.to(datum, V3Types.OrderDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Constructs a deposit datum object for V3 deposits, based on the specified arguments. This function
   * creates a comprehensive deposit datum structure, which includes the destination address, the pool ident,
   * owner information, scooper fee, and the deposit order details. The deposit order specifies the assets involved
   * in the deposit. The constructed datum is then converted to an inline format, suitable for embedding within
   * transactions, and its hash is calculated. The function returns an object containing the hash of the inline datum,
   * the inline datum itself, and the schema of the original datum, which are key for facilitating the deposit operation
   * within a transactional framework.
   *
   * @param {IDatumBuilderDepositV3Args} args - The deposit arguments for constructing the V3 deposit datum.
   * @returns {TDatumResult<V3Types.TOrderDatum>} An object comprising the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original deposit datum, essential for the execution of the deposit operation.
   */
  public buildDepositDatum({
    destinationAddress,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderDepositV3Args): TDatumResult<V3Types.TOrderDatum> {
    const datum: V3Types.TOrderDatum = {
      destination: this.buildDestinationAddresses(destinationAddress).schema,
      order: {
        Deposit: {
          assets: [
            this.buildAssetAmountDatum(order.assetA).schema,
            this.buildAssetAmountDatum(order.assetB).schema,
          ],
        },
      },
      owner: this.buildOwnerDatum(ownerAddress ?? destinationAddress.address)
        .schema,
      poolIdent: this.validatePoolIdent(ident),
      scooperFee,
      extension: Data.void().toCbor(),
    };

    const data = Data.to(datum, V3Types.OrderDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Creates a withdraw datum object for V3 withdrawals, utilizing the provided arguments. This function
   * assembles a detailed withdraw datum structure, which encompasses the destination address, pool ident,
   * owner information, scooper fee, and the withdrawal order details. The withdrawal order defines the amount
   * of LP (Liquidity Provider) tokens involved in the withdrawal. Once the datum is constructed, it is converted
   * into an inline format, suitable for transaction embedding, and its hash is calculated. The function returns
   * an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
   * datum, facilitating the withdrawal operation within a transactional context.
   *
   * @param {IDatumBuilderWithdrawV3Args} args - The withdrawal arguments for constructing the V3 withdraw datum.
   * @returns {TDatumResult<V3Types.TOrderDatum>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original withdraw datum, crucial for the execution of the withdrawal operation.
   */
  public buildWithdrawDatum({
    destinationAddress,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderWithdrawV3Args): TDatumResult<V3Types.TOrderDatum> {
    const datum: V3Types.TOrderDatum = {
      destination: this.buildDestinationAddresses(destinationAddress).schema,
      extension: Data.void().toCbor(),
      order: {
        Withdrawal: {
          amount: this.buildAssetAmountDatum(order.lpToken).schema,
        },
      },
      owner: this.buildOwnerDatum(ownerAddress ?? destinationAddress.address)
        .schema,
      poolIdent: this.validatePoolIdent(ident),
      scooperFee: scooperFee,
    };

    const data = Data.to(datum, V3Types.OrderDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  public buildStrategyDatum({
    destination,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderStrategyV3Args): TDatumResult<V3Types.TOrderDatum> {
    const auth = order.signer
      ? {
          Signature: { signer: order.signer },
        }
      : {
          Script: { script: order.script! },
        };
    const datum: V3Types.TOrderDatum = {
      destination: this.buildDestination(destination).schema,
      extension: Data.void().toCbor(),
      order: {
        Strategy: {
          auth,
        },
      },
      owner: this.buildOwnerDatum(ownerAddress).schema,
      poolIdent: this.validatePoolIdent(ident),
      scooperFee: scooperFee,
    };

    const data = Data.to(datum, V3Types.OrderDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
   * to the pool minting contract. See {@link Core.TxBuilderV3} for more details.
   *
   * @param {IDatumBuilderMintPoolV3Args} params The arguments for building a pool mint datum.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - fee: The pool fee represented as per thousand.
   *  - marketOpen: The POSIX timestamp for when pool trades should start executing.
   *  - protocolFee: The fee gathered for the protocol treasury.
   *  - seedUtxo: The UTXO to use as the seed, which generates asset names and the pool ident.
   *
   * @returns {TDatumResult<V3Types.TPoolDatum>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original pool mint datum, crucial for the execution
   *                                              of the minting pool operation.
   */
  public buildMintPoolDatum({
    assetA,
    assetB,
    fees,
    marketOpen,
    depositFee,
    seedUtxo,
  }: IDatumBuilderMintPoolV3Args): TDatumResult<V3Types.TPoolDatum> {
    const ident = DatumBuilderV3.computePoolId(seedUtxo);
    const liquidity = sqrt(assetA.amount * assetB.amount);

    const assetsPair = this.buildLexicographicalAssetsDatum(
      assetA,
      assetB,
    ).schema;

    const newPoolDatum: V3Types.TPoolDatum = {
      assets: assetsPair,
      circulatingLp: liquidity,
      bidFeePer10Thousand: fees.bid,
      askFeePer10Thousand: fees.ask,
      feeManager: null,
      identifier: ident,
      marketOpen: marketOpen || 0n,
      protocolFee: depositFee,
    };

    const data = Data.to(newPoolDatum, V3Types.PoolDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: newPoolDatum,
    };
  }

  /**
   * Creates a redeemer datum for minting a new pool. This is attached to the new assets that
   * creating a new pool mints on the blockchain. See {@link Core.TxBuilderV3} for more
   * details.
   *
   * @param {IDatumBuilderPoolMintRedeemerV3Args} param The assets being supplied to the new pool.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   * @returns {TDatumResult<V3Types.TPoolMintRedeemer>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original pool mint redeemer datum, crucial for the execution
   *                                              of the minting pool operation.
   */
  public buildPoolMintRedeemerDatum({
    assetA,
    assetB,
    metadataOutput,
    poolOutput,
  }: IDatumBuilderPoolMintRedeemerV3Args): TDatumResult<V3Types.TPoolMintRedeemer> {
    const poolMintRedeemer: V3Types.TPoolMintRedeemer = {
      CreatePool: {
        assets: this.buildLexicographicalAssetsDatum(assetA, assetB).schema,
        poolOutput,
        metadataOutput,
      },
    };

    const data = Data.to(poolMintRedeemer, V3Types.PoolMintRedeemer);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: poolMintRedeemer,
    };
  }

  public buildDestination(
    destination: TDestination,
  ): TDatumResult<V3Types.TDestination> {
    switch (destination.type) {
      case EDestinationType.FIXED:
        return this.buildDestinationAddresses(destination);
      case EDestinationType.SELF: {
        const value = "Self" as const;
        const data = Data.to(value, V3Types.DestinationSchema);
        return {
          hash: data.hash(),
          inline: data.toCbor(),
          schema: value,
        };
      }
      default:
        throw new Error("Unrecognized destination type");
    }
  }

  public buildDestinationAddresses({
    address,
    datum,
  }: TDestinationAddress): TDatumResult<V3Types.TDestination> {
    BlazeHelper.validateAddressAndDatumAreValid({
      address: address,
      datum: datum,
      network: this.network,
    });

    let formattedDatum: V3Types.TDatumSchema;
    switch (datum.type) {
      case EDatumType.NONE:
        formattedDatum = "VOID";
        break;
      case EDatumType.HASH:
        formattedDatum = {
          Hash: {
            value: datum.value,
          },
        };
        break;
      case EDatumType.INLINE:
        formattedDatum = {
          Inline: {
            value: Core.PlutusData.fromCbor(Core.HexBlob(datum.value)),
          },
        };
        break;
      default:
        throw new Error(
          "Could not find a matching datum type for the destination address. Aborting.",
        );
    }

    const paymentPart = BlazeHelper.getPaymentHashFromBech32(address);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(address);

    const destinationDatum: V3Types.TDestination = {
      Fixed: {
        address: {
          paymentCredential: BlazeHelper.isScriptAddress(address)
            ? {
                SCredential: {
                  bytes: paymentPart,
                },
              }
            : {
                VKeyCredential: {
                  bytes: paymentPart,
                },
              },

          stakeCredential: stakingPart
            ? {
                keyHash: {
                  VKeyCredential: {
                    bytes: stakingPart,
                  },
                },
              }
            : null,
        },
        datum: formattedDatum,
      },
    };

    const data = Data.to(destinationDatum, V3Types.Destination);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: destinationDatum,
    };
  }

  public buildOwnerDatum(main: string): TDatumResult<V3Types.TMultiSigScript> {
    BlazeHelper.validateAddressNetwork(main, this.network);
    const paymentPart = BlazeHelper.getPaymentHashFromBech32(main);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(main);

    let ownerDatum: V3Types.TMultiSigScript;
    if (BlazeHelper.isScriptAddress(main)) {
      ownerDatum = {
        Script: { hex: stakingPart || paymentPart },
      };
    } else {
      ownerDatum = {
        Address: { hex: stakingPart || paymentPart },
      };
    }

    const data = Data.to(ownerDatum, V3Types.MultiSigScript);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: ownerDatum,
    };
  }

  public buildAssetAmountDatum(
    asset: AssetAmount<IAssetAmountMetadata>,
  ): TDatumResult<V3Types.TSingletonValue> {
    const isAdaLovelace = SundaeUtils.isAdaAsset(asset.metadata);

    const value: V3Types.TSingletonValue = [
      isAdaLovelace ? "" : asset.metadata.assetId.split(".")[0],
      isAdaLovelace ? "" : asset.metadata.assetId.split(".")[1],
      asset.amount,
    ];

    const data = Data.to(value, V3Types.SingletonValue);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: value,
    };
  }

  public buildLexicographicalAssetsDatum(
    assetA: AssetAmount<IAssetAmountMetadata>,
    assetB: AssetAmount<IAssetAmountMetadata>,
  ): TDatumResult<[V3Types.TAssetClass, V3Types.TAssetClass]> {
    const lexicographicalAssets = SundaeUtils.sortSwapAssetsWithAmounts([
      assetA,
      assetB,
    ]);

    const assets = lexicographicalAssets.reduce(
      (result, { metadata }) => {
        if (SundaeUtils.isAdaAsset(metadata)) {
          result.push(["", ""]);
          return result;
        }

        const [policyId, assetName = ""] = metadata.assetId.split(".");
        if (!policyId) {
          throw new Error(
            `Invalid asset format for minting a pool with ${metadata.assetId}. Expected a policyID.`,
          );
        }

        result.push([policyId, assetName]);
        return result;
      },
      [] as unknown as [V3Types.TAssetClass, V3Types.TAssetClass],
    );

    const data = Data.to(assets, V3Types.AssetClassPair);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: assets,
    };
  }

  public validatePoolIdent(ident: string): string {
    if (!SundaeUtils.isV3PoolIdent(ident)) {
      throw new Error(DatumBuilderV3.INVALID_POOL_IDENT);
    }

    return ident;
  }

  /**
   * Computes the pool NFT name.
   *
   * @param {string} poolId The hex encoded pool ident.
   * @returns {string}
   */
  static computePoolNftName(poolId: string): string {
    const prefix = new Uint8Array([0x00, 0x0d, 0xe1, 0x40]);
    const name = new Uint8Array([...prefix, ...Buffer.from(poolId, "hex")]);
    return Buffer.from(name).toString("hex");
  }

  /**
   * Computes the pool liquidity name.
   *
   * @param {string} poolId The hex encoded pool ident.
   * @returns {string}
   */
  static computePoolLqName(poolId: string): string {
    const prefix = new Uint8Array([0x00, 0x14, 0xdf, 0x10]);
    const name = new Uint8Array([...prefix, ...Buffer.from(poolId, "hex")]);
    return Buffer.from(name).toString("hex");
  }

  /**
   * Computes the pool reference name.
   *
   * @param {string} poolId The hex encoded pool ident.
   * @returns {string}
   */
  static computePoolRefName(poolId: string): string {
    const prefix = new Uint8Array([0x00, 0x06, 0x43, 0xb0]);
    const name = new Uint8Array([...prefix, ...Buffer.from(poolId, "hex")]);
    return Buffer.from(name).toString("hex");
  }

  /**
   * Computes the pool ID based on the provided UTxO being spent.
   *
   * @param {UTxO} seed The UTxO txHash and index.
   * @returns {string}
   */
  static computePoolId(seed: { txHash: string; outputIndex: number }): string {
    const poolInputTxHash = Buffer.from(seed.txHash, "hex");
    const numberSign = new Uint8Array([0x23]);
    const poolInputTxIx = new Uint8Array([seed.outputIndex]);
    const poolInputRef = new Uint8Array([
      ...poolInputTxHash,
      ...numberSign,
      ...poolInputTxIx,
    ]);

    const hash = Buffer.from(
      Core.fromHex(Core.blake2b_256(Core.HexBlob(Core.toHex(poolInputRef))))
        // Truncate first four bytes and convert to hex string.
        .slice(4),
    ).toString("hex");

    return hash;
  }

  /**
   * Extracts the staking and payment key hashes from a given datum's destination address. This static method
   * parses the provided datum to retrieve the destination address and then extracts the staking key hash and payment
   * key hash, if they exist. The method supports addresses that may include both staking and payment credentials,
   * handling each accordingly. It returns an object containing the staking key hash and payment key hash, which can
   * be used for further processing or validation within the system.
   *
   * @param {string} datum - The serialized datum string from which the destination address and its credentials are to be extracted.
   * @returns {{ stakingKeyHash: string | undefined, paymentKeyHash: string | undefined }} An object containing the staking and
   *          payment key hashes extracted from the destination address within the datum. Each key hash is returned as a string
   *          if present, or `undefined` if the respective credential is not found in the address.
   */
  static getDestinationAddressesFromDatum(datum: string) {
    let stakingKeyHash: string | undefined;
    let paymentKeyHash: string | undefined;
    const { destination } = Data.from(
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
      V3Types.OrderDatum,
    );
    if (destination === "Self") {
      return { stakingKeyHash, paymentKeyHash };
    }
    const {
      Fixed: { address },
    } = destination;

    if (address.stakeCredential && address.stakeCredential.keyHash) {
      const hash = (address.stakeCredential.keyHash as V3Types.TVKeyCredential)
        .VKeyCredential.bytes;
      if (hash) {
        stakingKeyHash = hash;
      }
    }

    if (address.paymentCredential) {
      const hash = (address.paymentCredential as V3Types.TVKeyCredential)
        .VKeyCredential.bytes;
      if (hash) {
        paymentKeyHash = hash;
      }
    }

    return {
      stakingKeyHash,
      paymentKeyHash,
    };
  }

  /**
   * Retrieves the owner's signing key from a given datum. This static method parses the provided
   * datum to extract the owner's information, specifically focusing on the signing key associated
   * with the owner. This key is crucial for validating ownership and authorizing transactions within
   * the system. The method is designed to work with datums structured according to V3Types.OrderDatum,
   * ensuring compatibility with specific transaction formats.
   *
   * @param {string} datum - The serialized datum string from which the owner's signing key is to be extracted.
   * @returns {string} The signing key associated with the owner, extracted from the datum. This key is used
   *          for transaction validation and authorization purposes.
   */
  static getSignerKeyFromDatum(datum: string): string | undefined {
    const { owner } = Data.from(
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
      V3Types.OrderDatum,
    );

    if (
      typeof (owner as V3Types.TSignatureSchema)?.Address === "object" &&
      typeof (owner as V3Types.TSignatureSchema).Address.hex === "string"
    ) {
      return (owner as V3Types.TSignatureSchema).Address.hex;
    }

    if (
      typeof (owner as V3Types.TScriptSchema)?.Script === "object" &&
      typeof (owner as V3Types.TScriptSchema).Script.hex === "string"
    ) {
      return (owner as V3Types.TScriptSchema).Script.hex;
    }

    return undefined;
  }

  static addressSchemaToBech32(
    datum: V3Types.TAddressSchema,
    network: Core.NetworkId,
  ): string {
    let paymentKeyHash: string;
    let paymentAddressType: Core.CredentialType;
    if ((datum.paymentCredential as V3Types.TVKeyCredential)?.VKeyCredential) {
      paymentAddressType = Core.CredentialType.KeyHash;
      paymentKeyHash = (datum.paymentCredential as V3Types.TVKeyCredential)
        .VKeyCredential.bytes;
    } else if ((datum.paymentCredential as V3Types.TSCredential)?.SCredential) {
      paymentAddressType = Core.CredentialType.ScriptHash;
      paymentKeyHash = (datum.paymentCredential as V3Types.TSCredential)
        .SCredential.bytes;
    } else {
      throw new Error(
        "Could not determine the address type from supplied payment credential.",
      );
    }

    const result: Record<string, Core.Credential> = {
      paymentCredential: Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(paymentKeyHash),
        type: paymentAddressType,
      }),
    };

    if (datum.stakeCredential?.keyHash) {
      let stakingKeyHash: string | undefined;
      let stakingAddressType: Core.CredentialType | undefined;
      if (
        (datum.stakeCredential.keyHash as V3Types.TVKeyCredential)
          ?.VKeyCredential
      ) {
        stakingAddressType = Core.CredentialType.KeyHash;
        stakingKeyHash = (
          datum.stakeCredential.keyHash as V3Types.TVKeyCredential
        ).VKeyCredential.bytes;
      } else if (
        (datum.stakeCredential.keyHash as V3Types.TSCredential)?.SCredential
      ) {
        stakingAddressType = Core.CredentialType.ScriptHash;
        stakingKeyHash = (datum.stakeCredential.keyHash as V3Types.TSCredential)
          .SCredential.bytes;
      }

      if (stakingKeyHash && stakingAddressType) {
        result.stakeCredential = Core.Credential.fromCore({
          hash: Core.Hash28ByteBase16(stakingKeyHash),
          type: stakingAddressType,
        });
      }
    }

    return Core.addressFromCredentials(
      network,
      result.paymentCredential,
      result.stakeCredential,
    ).toBech32();
  }
}
