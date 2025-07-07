import { Core } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { parse, serialize, Void } from "@blaze-cardano/data";
import {
  EDatumType,
  EDestinationType,
  IFeesConfig,
  TDatumBuilderMintPoolArgs,
  TDatumResult,
  TDestination,
  TDestinationAddress,
  TPoolDatumTypes,
  TSupportedNetworks
} from "../@types/index.js";
import { DatumBuilderAbstract } from "../Abstracts/DatumBuilder.abstract.class.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import { V3Types } from "./GeneratedContractTypes/index.js";

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
 * the V3 & Condition pool contract.
 */
export interface IDatumBuilderMintPoolArgs {
  seedUtxo: { txHash: string; outputIndex: number };
  assetA: AssetAmount<IAssetAmountMetadata>;
  assetB: AssetAmount<IAssetAmountMetadata>;
  fees: IFeesConfig;
  depositFee: bigint;
  marketOpen?: bigint;
  feeManager?: string;
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
export class DatumBuilderV3Like implements DatumBuilderAbstract {
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
   * @returns {TDatumResult<V3Types.OrderDatum>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original swap datum, essential for the execution of the swap operation.
   */
  public buildSwapDatum({
    destinationAddress,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderSwapV3Args): TDatumResult<V3Types.OrderDatum> {
    const datum: V3Types.OrderDatum = {
      poolIdent: this.validatePoolIdent(ident),
      destination: this.buildDestinationAddresses(destinationAddress).schema,
      owner: this.buildOwnerDatum(ownerAddress ?? destinationAddress.address)
        .schema,
      maxProtocolFee: scooperFee,
      details: {
        Swap: {
          offer: this.buildAssetAmountDatum(order.offered).schema,
          minReceived: this.buildAssetAmountDatum(order.minReceived).schema,
        },
      },
      extension: Void(),
    };

    const data = serialize(V3Types.OrderDatum, datum);

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
   * @returns {TDatumResult<V3Types.OrderDatum>} An object comprising the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original deposit datum, essential for the execution of the deposit operation.
   */
  public buildDepositDatum({
    destinationAddress,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderDepositV3Args): TDatumResult<V3Types.OrderDatum> {
    const datum: V3Types.OrderDatum = {
      destination: this.buildDestinationAddresses(destinationAddress).schema,
      details: {
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
      maxProtocolFee: scooperFee,
      extension: Void(),
    };

    const data = serialize(V3Types.OrderDatum, datum);

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
   * @returns {TDatumResult<V3Types.OrderDatum>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original withdraw datum, crucial for the execution of the withdrawal operation.
   */
  public buildWithdrawDatum({
    destinationAddress,
    ident,
    order,
    ownerAddress,
    scooperFee,
  }: IDatumBuilderWithdrawV3Args): TDatumResult<V3Types.OrderDatum> {
    const datum: V3Types.OrderDatum = {
      destination: this.buildDestinationAddresses(destinationAddress).schema,
      extension: Void(),
      details: {
        Withdrawal: {
          amount: this.buildAssetAmountDatum(order.lpToken).schema,
        },
      },
      owner: this.buildOwnerDatum(ownerAddress ?? destinationAddress.address)
        .schema,
      poolIdent: this.validatePoolIdent(ident),
      maxProtocolFee: scooperFee,
    };

    const data = serialize(V3Types.OrderDatum, datum);

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
  }: IDatumBuilderStrategyV3Args): TDatumResult<V3Types.OrderDatum> {
    const auth = order.signer
      ? {
          Signature: { signer: order.signer },
        }
      : {
          Script: { script: order.script! },
        };
    const datum: V3Types.OrderDatum = {
      destination: this.buildDestination(destination).schema,
      extension: Void(),
      details: {
        Strategy: {
          auth,
        },
      },
      owner: this.buildOwnerDatum(ownerAddress).schema,
      poolIdent: this.validatePoolIdent(ident),
      maxProtocolFee: scooperFee,
    };

    const data = serialize(V3Types.OrderDatum, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  public getMultiSigFromAddress(
    address?: string,
  ): V3Types.MultisigScript | undefined {
    if (!address) return undefined;

    try {
      const paymentHash =
        Core.addressFromBech32(address).getProps().paymentPart?.hash;
      if (!paymentHash) return undefined;

      if (BlazeHelper.isScriptAddress(address)) {
        return { Script: { scriptHash: paymentHash } };
      } else {
        return { Signature: { keyHash: paymentHash } };
      }
    } catch (error) {
      throw new Error(
        `Failed to extract payment hash from address: ${address}. Error: ${(error as Error).message}`,
      );
    }
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
  public buildMintPoolDatum(_args: TDatumBuilderMintPoolArgs): TDatumResult<TPoolDatumTypes> {
    throw new Error(
      "This method is not implemented in the V3Like DatumBuilder. Use a specific implementation for V3 or Stableswaps.",
    );
  }

  /**
   * Creates a redeemer datum for minting a new pool. This is attached to the new assets that
   * creating a new pool mints on the blockchain. See {@link Core.TxBuilderV3} for more
   * details.
   *
   * @param {IDatumBuilderPoolMintRedeemerV3Args} param The assets being supplied to the new pool.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   * @returns {TDatumResult<V3Types.PoolMintRedeemer>} An object containing the hash of the inline datum, the inline datum itself,
   *                                              and the schema of the original pool mint redeemer datum, crucial for the execution
   *                                              of the minting pool operation.
   */
  public buildPoolMintRedeemerDatum({
    assetA,
    assetB,
    metadataOutput,
    poolOutput,
  }: IDatumBuilderPoolMintRedeemerV3Args): TDatumResult<V3Types.PoolMintRedeemer> {
    const poolMintRedeemer: V3Types.PoolMintRedeemer = {
      CreatePool: {
        assets: this.buildLexicographicalAssetsDatum(assetA, assetB).schema,
        poolOutput,
        metadataOutput,
      },
    };

    const data = serialize(V3Types.PoolMintRedeemer, poolMintRedeemer);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: poolMintRedeemer,
    };
  }

  public buildDestination(
    destination: TDestination,
  ): TDatumResult<V3Types.Destination> {
    switch (destination.type) {
      case EDestinationType.FIXED:
        return this.buildDestinationAddresses(destination);
      case EDestinationType.SELF: {
        const value = "Self" as const;
        const data = serialize(V3Types.Destination, value);
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
  }: TDestinationAddress): TDatumResult<V3Types.Destination> {
    BlazeHelper.validateAddressAndDatumAreValid({
      address: address,
      datum: datum,
      network: this.network,
    });

    let formattedDatum;
    switch (datum.type) {
      case EDatumType.NONE:
        formattedDatum = "NoDatum" as const;
        break;
      case EDatumType.HASH:
        formattedDatum = {
          DatumHash: [datum.value] as [string],
        };
        break;
      case EDatumType.INLINE:
        formattedDatum = {
          InlineDatum: [Core.PlutusData.fromCbor(Core.HexBlob(datum.value))] as [Core.PlutusData],
        };
        break;
      default:
        throw new Error(
          "Could not find a matching datum type for the destination address. Aborting.",
        );
    }

    const paymentPart = BlazeHelper.getPaymentHashFromBech32(address);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(address);

    const destinationDatum: V3Types.Destination = {
      Fixed: {
        address: {
          paymentCredential: BlazeHelper.isScriptAddress(address)
            ? {
                ScriptCredential: [paymentPart],
              }
            : {
                VerificationKeyCredential: [paymentPart],
              },

          stakeCredential: stakingPart
            ? {
                Inline: [{
                  VerificationKeyCredential: [stakingPart]
                }],
              }
            : undefined,
        },
        datum: formattedDatum,
      },
    };

    const data = serialize(V3Types.Destination, destinationDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: destinationDatum,
    };
  }

  public buildOwnerDatum(main: string): TDatumResult<V3Types.MultisigScript> {
    BlazeHelper.validateAddressNetwork(main, this.network);
    const paymentPart = BlazeHelper.getPaymentHashFromBech32(main);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(main);

    let ownerDatum: V3Types.MultisigScript;
    if (BlazeHelper.isScriptAddress(main)) {
      ownerDatum = {
        Script: { scriptHash: stakingPart || paymentPart },
      };
    } else {
      ownerDatum = {
        Signature: { keyHash: stakingPart || paymentPart },
      };
    }

    const data = serialize(V3Types.MultisigScript, ownerDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: ownerDatum,
    };
  }

  public buildAssetAmountDatum(
    asset: AssetAmount<IAssetAmountMetadata>,
  ): TDatumResult<V3Types.Tuple$ByteArray_ByteArray_Int> {
    const isAdaLovelace = SundaeUtils.isAdaAsset(asset.metadata);

    const value: V3Types.Tuple$ByteArray_ByteArray_Int = [
      isAdaLovelace ? "" : asset.metadata.assetId.split(".")[0],
      isAdaLovelace ? "" : asset.metadata.assetId.split(".")[1],
      asset.amount,
    ];

    const data = serialize(V3Types.Tuple$ByteArray_ByteArray_Int, value);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: value,
    };
  }

  public buildLexicographicalAssetsDatum(
    assetA: AssetAmount<IAssetAmountMetadata>,
    assetB: AssetAmount<IAssetAmountMetadata>,
  ): TDatumResult<[V3Types.Tuple$ByteArray_ByteArray, V3Types.Tuple$ByteArray_ByteArray]> {
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
      [] as unknown as [V3Types.Tuple$ByteArray_ByteArray, V3Types.Tuple$ByteArray_ByteArray],
    );

    const data = serialize(V3Types.Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray, assets);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: assets,
    };
  }

  public validatePoolIdent(ident: string): string {
    if (!SundaeUtils.isV3PoolIdent(ident)) {
      throw new Error(DatumBuilderV3Like.INVALID_POOL_IDENT);
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
    const { destination } = parse(
      V3Types.OrderDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
      
    );
    if (destination === "Self") {
      return { stakingKeyHash, paymentKeyHash };
    }
    const {
      Fixed: { address },
    } = destination;

    if (address.stakeCredential && "Inline" in address.stakeCredential) {
      if ("VerificationKeyCredential" in address.stakeCredential.Inline[0]) {
        const [hash] = address.stakeCredential.Inline[0].VerificationKeyCredential;
        if (hash) {
          stakingKeyHash = hash;
        }
      }
    }

    if (address.paymentCredential && "VerificationKeyCredential" in address.paymentCredential) {
      const [hash] = address.paymentCredential.VerificationKeyCredential;
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
    const { owner } = parse(
      V3Types.OrderDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
    );

    if ("Signature" in owner) {
      return owner.Signature.keyHash;
    }

    if ("Script" in owner) {
      return owner.Script.scriptHash;
    }

    return undefined;
  }

  static credentialToCore(credential: {
    VerificationKeyCredential: [string];
} | {
    ScriptCredential: [string];
}): Core.Credential {
    if ("VerificationKeyCredential" in credential) {
      return Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(credential.VerificationKeyCredential[0]),
        type: Core.CredentialType.KeyHash,
      });
    } else if ("ScriptCredential" in credential) {
      return Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(credential.ScriptCredential[0]),
        type: Core.CredentialType.ScriptHash,
      });
    } else {
      throw new Error(
        "Invalid credential type. Expected either VerificationKeyCredential or ScriptCredential.",
      );
    }
  } 

  static getMetadataAddressFromSettingsDatum(datum: string, network: Core.NetworkId): string {
    const {
      metadataAdmin: { paymentCredential, stakeCredential },
    } = parse(
      V3Types.SettingsDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
    );

    let stakeCoreCredential: Core.Credential | undefined;
    if (stakeCredential && "Inline" in stakeCredential) {
      const [credential] = stakeCredential.Inline;
      stakeCoreCredential = DatumBuilderV3Like.credentialToCore(credential);
    }

    return Core.addressFromCredentials(
      network,
      DatumBuilderV3Like.credentialToCore(paymentCredential),
      stakeCoreCredential,
    ).toBech32();
  }

  static getStakeAddressFromSettingsDatum(datum: string, paymentHash: string, network: Core.NetworkId): string {
    const {
      authorizedStakingKeys: [poolStakingCredential],
    } = parse(
      V3Types.SettingsDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
    );
    return Core.addressFromCredentials(
      network,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(paymentHash),
        type: Core.CredentialType.ScriptHash,
      }),
      DatumBuilderV3Like.credentialToCore(poolStakingCredential),
    ).toBech32();
  }

  static getTreasuryAddress(datum: string, network: Core.NetworkId): string {
    const { treasuryAddress } = parse(
      V3Types.SettingsDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
    );

    if (!treasuryAddress) {
      throw new Error("Invalid treasury address in settings datum.");
    }

    let stakeCoreCredential: Core.Credential | undefined;
    if (treasuryAddress.stakeCredential && "Inline" in treasuryAddress.stakeCredential) {
      const [credential] = treasuryAddress.stakeCredential.Inline;
      stakeCoreCredential = DatumBuilderV3Like.credentialToCore(credential);
    }

    return Core.addressFromCredentials(
      network,
      DatumBuilderV3Like.credentialToCore(treasuryAddress.paymentCredential),
      stakeCoreCredential,
    ).toBech32();
  }

//   static addressSchemaToBech32(
//     datum: V3Types.Destination.Fixed.Address,
//     network: Core.NetworkId,
//   ): string {
//     let paymentKeyHash: string;
//     let paymentAddressType: Core.CredentialType;
//     if ((datum.paymentCredential as V3Types.TVKeyCredential)?.VKeyCredential) {
//       paymentAddressType = Core.CredentialType.KeyHash;
//       paymentKeyHash = (datum.paymentCredential as V3Types.TVKeyCredential)
//         .VKeyCredential.bytes;
//     } else if ((datum.paymentCredential as V3Types.TSCredential)?.SCredential) {
//       paymentAddressType = Core.CredentialType.ScriptHash;
//       paymentKeyHash = (datum.paymentCredential as V3Types.TSCredential)
//         .SCredential.bytes;
//     } else {
//       throw new Error(
//         "Could not determine the address type from supplied payment credential.",
//       );
//     }

//     const result: Record<string, Core.Credential> = {
//       paymentCredential: Core.Credential.fromCore({
//         hash: Core.Hash28ByteBase16(paymentKeyHash),
//         type: paymentAddressType,
//       }),
//     };

//     if (datum.stakeCredential?.keyHash) {
//       let stakingKeyHash: string | undefined;
//       let stakingAddressType: Core.CredentialType | undefined;
//       if (
//         (datum.stakeCredential.keyHash as V3Types.TVKeyCredential)
//           ?.VKeyCredential
//       ) {
//         stakingAddressType = Core.CredentialType.KeyHash;
//         stakingKeyHash = (
//           datum.stakeCredential.keyHash as V3Types.TVKeyCredential
//         ).VKeyCredential.bytes;
//       } else if (
//         (datum.stakeCredential.keyHash as V3Types.TSCredential)?.SCredential
//       ) {
//         stakingAddressType = Core.CredentialType.ScriptHash;
//         stakingKeyHash = (datum.stakeCredential.keyHash as V3Types.TSCredential)
//           .SCredential.bytes;
//       }

//       if (stakingKeyHash && stakingAddressType) {
//         result.stakeCredential = Core.Credential.fromCore({
//           hash: Core.Hash28ByteBase16(stakingKeyHash),
//           type: stakingAddressType,
//         });
//       }
//     }

//     return Core.addressFromCredentials(
//       network,
//       result.paymentCredential,
//       result.stakeCredential,
//     ).toBech32();
//   }
 }
