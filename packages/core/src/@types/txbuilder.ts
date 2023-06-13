import {
  TSupportedNetworks,
  TSupportedWallets,
  IPoolData,
  IAsset,
  OrderAddresses,
  PoolCoin,
} from ".";
import { AssetAmount } from "../classes/AssetAmount.class";

/**
 * The primary top-level API surface for dealing with built TxBuilder transactions.
 */
export interface ITxBuilderTx<T = unknown, K = unknown> {
  tx: T;
  fees: ITxBuilderFees;
  datum: K;
  sign: () => ITxBuilderTx;
  complete: () => Promise<ITxBuilderComplete>;
}

/**
 * The returned interface once a transaction is successfully built.
 */
export interface ITxBuilderComplete {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

/**
 * The full list of calculated fees for a transaction built by a TxBuilder instance.
 */
export interface ITxBuilderFees {
  cardanoTxFee: AssetAmount;
  deposit: AssetAmount;
  scooperFee: AssetAmount;
  liquidity?: AssetAmount;
  referral?: AssetAmount;
}

/**
 * The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
 * extend from this interface to ensure the wallet and network are compatible.
 */
export interface ITxBuilderBaseOptions {
  /** A CIP-30 compatible wallet. */
  wallet: TSupportedWallets;
  /** A supported Cardano network. */
  network: TSupportedNetworks;
}

/**
 * The minimum requirements for an order.
 */
export interface IOrderArgs {
  pool: IPoolData;
}

/**
 * The minimum requirements for a Swap order.
 */
export interface ISwapArgs extends IOrderArgs {
  orderAddresses: OrderAddresses;
  suppliedAsset: IAsset;
  minReceivable: AssetAmount;
}

/**
 * The minimum requirements for a Deposit order.
 */
export interface IDepositArgs extends IOrderArgs {
  orderAddresses: OrderAddresses;
  suppliedAssets: [IAsset, IAsset];
}

/**
 * The minimum requirements for a Deposit order.
 */
export interface IZapArgs extends IOrderArgs {
  orderAddresses: OrderAddresses;
  zapDirection: PoolCoin;
  suppliedAsset: IAsset;
}

/**
 * The minimum requirements for a Deposit order.
 */
export interface IChainedZapArgs extends IOrderArgs {
  zapDirection: PoolCoin;
  suppliedAsset: IAsset;
}

/**
 * The minimum requirements for a WithdrawOrder
 */
export interface IWithdrawArgs extends IOrderArgs {
  orderAddresses: OrderAddresses;
  suppliedLPAsset: IAsset;
}
