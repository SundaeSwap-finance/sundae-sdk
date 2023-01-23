import {
  TSupportedNetworks,
  TSupportedWallets,
  IPoolData,
  IAsset,
  OrderAddresses,
} from ".";
import { AssetAmount } from "../classes/AssetAmount.class";

/**
 * The returned interface once a transaction is successfully built.
 */
export interface ITxBuilderComplete {
  /** The CBOR encoded hex string of the transcation. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

/**
 * The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
 * extend from this interface to ensure the wallet and network are compatible.
 */
export interface ITxBuilderOptions {
  /** A CIP-30 compatible wallet. */
  wallet: TSupportedWallets;
  /** A supported Cardano network. */
  network: TSupportedNetworks;
}

/**
 * The raw swap arguments used by {@link TxBuilder.buildSwapTx}.
 */
export interface IBuildSwapArgs {
  pool: IPoolData;
  suppliedAsset: IAsset;
  orderAddresses: OrderAddresses;
  minReceivable: AssetAmount;
}

/**
 * The arguments structure for a Deposit order.
 */
export interface IBuildDepositArgs {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
  suppliedAssets: [IAsset, IAsset];
}
