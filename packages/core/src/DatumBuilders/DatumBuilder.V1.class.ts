import { Core } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { serialize } from "@blaze-cardano/data";
import {
  EDatumType,
  EPoolCoin,
  IDepositArguments,
  // IDepositArguments,
  ISwapArguments,
  IWithdrawArguments,
  // IWithdrawArguments,
  // IZapArguments,
  TDatumResult,
  TOrderAddressesArgs,
  TSupportedNetworks,
  TSwap,
} from "../@types/index.js";
import { DatumBuilderAbstract } from "../Abstracts/DatumBuilder.abstract.class.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { V1_MAX_POOL_IDENT_LENGTH } from "../constants.js";
import { V1Types } from "./GeneratedContractTypes/index.js";

/**
 * The Blaze implementation for building valid Datums for
 * V1 contracts on the SundaeSwap protocol.
 */
export class DatumBuilderV1 implements DatumBuilderAbstract {
  /** The current network id. */
  public network: TSupportedNetworks;
  /** The error to throw when the pool ident does not match V1 constraints. */
  static INVALID_POOL_IDENT =
    "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";

  constructor(
    network: TSupportedNetworks,
    private validatorScriptHashes?: Set<string>,
  ) {
    this.network = network;
  }

  /**
   * Utility to register a validator script hash.
   * @param {string} hash The validator script hash.
   */
  registerValidatorScriptHash(hash: string) {
    if (!this.validatorScriptHashes) {
      this.validatorScriptHashes = new Set();
    }

    this.validatorScriptHashes!.add(hash);
  }

  /**
   * Constructs a swap datum object based on the provided swap arguments.
   * The function initializes a new datum with specific properties such as the pool ident,
   * order addresses, scooper fee, and swap direction schema. It then converts this datum
   * into an inline format and computes its hash using {@link Core.BlazeHelper}. The function returns an
   * object containing the hash of the inline datum, the inline datum itself, and the original
   * datum schema.
   *
   * @param {ISwapArguments} params - The swap arguments required to build the swap datum.
   * @returns {TDatumResult<Data>} An object containing the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum.
   */
  buildSwapDatum({
    ident,
    orderAddresses,
    fundedAsset,
    swap,
    scooperFee,
  }: ISwapArguments): TDatumResult<V1Types.SwapOrder> {
    const datum: V1Types.SwapOrder = {
      ident: this.buildPoolIdent(ident),
      orderAddresses: this.buildOrderAddresses(orderAddresses).schema,
      scooperFee: scooperFee,
      swapDirection: this.buildSwapDirection(swap, fundedAsset).schema,
    };

    const data = serialize(V1Types.SwapOrder, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Creates a deposit datum object from the given deposit arguments. The function initializes
   * a new datum with specific properties such as the pool ident, order addresses, scooper fee,
   * and deposit pair schema. It then converts this datum into an inline format and calculates
   * its hash using {@link Core.BlazeHelper}. The function returns an object containing the hash of the inline
   * datum, the inline datum itself, and the original datum schema.
   *
   * @param {IDepositArguments} params - The deposit arguments required to construct the deposit datum.
   * @returns {TDatumResult<Data>} An object containing the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum.
   */
  buildDepositDatum({
    ident,
    orderAddresses,
    deposit,
    scooperFee,
  }: IDepositArguments): TDatumResult<V1Types.DepositOrder> {
    const datum: V1Types.DepositOrder = {
      ident: this.buildPoolIdent(ident),
      orderAddresses: this.buildOrderAddresses(orderAddresses).schema,
      scooperFee,
      DepositPair: {
          Child: {
              pair: {
                a: deposit.CoinAAmount.amount,
                b: deposit.CoinBAmount.amount,
              },
            },
          },
    };

    const data = serialize(V1Types.DepositOrder, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Generates a withdraw datum object from the specified withdraw arguments. This function constructs
   * a new datum with defined attributes such as the pool ident, order addresses, scooper fee, and
   * the schema for the supplied LP (Liquidity Provider) asset for withdrawal. After constructing the datum,
   * it is converted into an inline format, and its hash is calculated using {@link Core.BlazeHelper}. The function returns
   * an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
   * datum, which are crucial for executing the withdrawal operation within a transactional framework.
   *
   * @param {IWithdrawArguments} params - The arguments necessary to construct the withdraw datum.
   * @returns {TDatumResult<Data>} An object comprising the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum, facilitating the withdrawal operation's integration into the transactional process.
   */
  buildWithdrawDatum({
    ident,
    orderAddresses,
    suppliedLPAsset,
    scooperFee,
  }: IWithdrawArguments): TDatumResult<V1Types.WithdrawOrder> {
    const datum: V1Types.WithdrawOrder = {
      ident: this.buildPoolIdent(ident),
      orderAddresses: this.buildOrderAddresses(orderAddresses).schema,
      scooperFee,
      WithdrawAsset: 
        {
          value: suppliedLPAsset.amount,
        },
      
    };

    const data = serialize(V1Types.WithdrawOrder, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  buildSwapDirection(
    swap: TSwap,
    amount: AssetAmount<IAssetAmountMetadata>,
  ): TDatumResult<V1Types.SwapDirection> {
    const datum: V1Types.SwapDirection = {
      amount: amount.amount,
      minReceivable: swap.MinimumReceivable
        ? swap.MinimumReceivable.amount
        : undefined,
      suppliedAssetIndex: swap.SuppliedCoin === EPoolCoin.A ? "A" : "B",
    };

    const data = serialize(V1Types.SwapDirection, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  buildOrderAddresses(
    addresses: TOrderAddressesArgs,
  ): TDatumResult<V1Types.OrderAddresses> {
    BlazeHelper.validateAddressAndDatumAreValid({
      ...addresses.DestinationAddress,
      network: this.network,
    });

    addresses?.AlternateAddress &&
      BlazeHelper.validateAddressAndDatumAreValid({
        address: addresses.AlternateAddress,
        network: this.network,
        datum: {
          type: EDatumType.NONE,
        },
      });

    const { DestinationAddress, AlternateAddress } = addresses;

    let destinationIsOrderScript = false;
    const addressPaymentHash = Core.Address.fromBech32(
      DestinationAddress.address,
    );
    for (const validatorScriptHash of this.validatorScriptHashes || new Set()) {
      if (
        addressPaymentHash.getProps().paymentPart?.hash === validatorScriptHash
      ) {
        destinationIsOrderScript = true;
        break;
      }
    }

    if (
      DestinationAddress.datum.type !== EDatumType.HASH &&
      destinationIsOrderScript
    ) {
      throw new Error(
        "Inline datum types are not supported in V1 contracts! Convert this to a hash.",
      );
    }

    const paymentPart = BlazeHelper.getPaymentHashFromBech32(
      DestinationAddress.address,
    );
    const stakingPart = BlazeHelper.getStakingHashFromBech32(
      DestinationAddress.address,
    );

    let paymentKeyData: V1Types.PaymentStakingHash | undefined;
    if (BlazeHelper.isScriptAddress(DestinationAddress.address)) {
      paymentKeyData = {
        ScriptHash: {
          scriptHash: paymentPart,
        },
      };
    } else {
      paymentKeyData = {
        KeyHash: {
          keyHash: paymentPart,
        },
      };
    }

    let stakingKeyData: V1Types.PaymentStakingHash | undefined;
    if (stakingPart) {
      if (BlazeHelper.isScriptAddress(DestinationAddress.address)) {
        stakingKeyData = {
          ScriptHash: {
            scriptHash: stakingPart,
          },
        };
      } else {
        stakingKeyData = {
          KeyHash: {
            keyHash: stakingPart,
          },
        };
      }
    }

    const destination: V1Types.Destination = {
      credentials: {
        paymentKey: paymentKeyData,
        stakingKey: stakingKeyData ? { value: stakingKeyData } : undefined,
      },
      datum:
        DestinationAddress.datum.type !== EDatumType.NONE
          ? DestinationAddress.datum.value
          : undefined,
    };

    let alternatePaymentPart: string | undefined = undefined;
    let alternateStakingPart: string | undefined;

    if (AlternateAddress) {
      alternatePaymentPart =
        BlazeHelper.getPaymentHashFromBech32(AlternateAddress);
      alternateStakingPart =
        BlazeHelper.getStakingHashFromBech32(AlternateAddress);
    }

    const datum: V1Types.OrderAddresses = {
      destination,
      alternate: alternateStakingPart || alternatePaymentPart,
    };

    const data = serialize(V1Types.OrderAddresses, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  buildPoolIdent(ident: string): string {
    if (ident.length > V1_MAX_POOL_IDENT_LENGTH) {
      throw new Error(DatumBuilderV1.INVALID_POOL_IDENT);
    }

    return ident;
  }
}
