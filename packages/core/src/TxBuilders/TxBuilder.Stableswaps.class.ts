import { Blaze, Provider, TxBuilder, Wallet } from "@blaze-cardano/sdk";
import {
  EContractVersion,
  IComposedTx,
  IMintPoolConfigArgs,
} from "../@types/index.js";
import { DatumBuilderStableswaps } from "../DatumBuilders/DatumBuilder.Stableswaps.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { TxBuilderV3 } from "./TxBuilder.V3.class.js";
import { Transaction } from "@blaze-cardano/core";

/**
 * `TxBuilderStableswaps` is a specialized transaction builder class for constructing transactions
 * against the Stableswaps protocol variant of SundaeSwap V3. It extends `TxBuilderV3` and provides
 * specific implementations for Stableswaps pool operations, including pool minting with protocol fees
 * derived from the settings datum.
 *
 * The Stableswaps protocol is designed for assets with similar values (e.g., stablecoins) and uses
 * a different AMM curve than standard constant product pools.
 *
 * @extends {TxBuilderV3}
 */
export class TxBuilderStableswaps extends TxBuilderV3 {
  /**
   * The contract version identifier for Stableswaps protocol.
   */
  contractVersion: EContractVersion = EContractVersion.Stableswaps;

  /**
   * The datum builder instance specifically for Stableswaps protocol, handling
   * datum construction and parsing for Stableswaps transactions.
   */
  datumBuilder: DatumBuilderStableswaps;

  /**
   * Constructs a new TxBuilderStableswaps instance.
   *
   * @param {Blaze<Provider, Wallet>} blaze - A configured Blaze instance for transaction building and signing.
   * @param {QueryProviderSundaeSwap} [queryProvider] - Optional custom query provider for fetching blockchain data.
   *        If not provided, a default QueryProviderSundaeSwap instance will be created.
   */
  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super(blaze, queryProvider);
    this.datumBuilder = new DatumBuilderStableswaps(this.network);
  }

  /**
   * Mints a new Stableswaps liquidity pool with the specified configuration.
   * This method extends the parent `mintPool` implementation by automatically fetching
   * and applying protocol fees from the settings datum before pool creation.
   *
   * The protocol fees are required for Stableswaps pools and are retrieved from the
   * on-chain settings UTXO to ensure they match the current protocol parameters.
   *
   * @param {IMintPoolConfigArgs} args - The configuration arguments for minting the pool, including:
   *   - Pool assets and their initial amounts
   *   - Pool fees
   *   - Owner address
   *   - Other pool-specific parameters
   * @returns {Promise<IComposedTx<TxBuilder, Transaction>>} A promise that resolves to the composed transaction
   *          ready for signing and submission.
   * @throws {Error} If the settings datum cannot be retrieved or protocol fees cannot be extracted.
   */
  async mintPool(
    args: IMintPoolConfigArgs,
  ): Promise<IComposedTx<TxBuilder, Transaction>> {
    const settingsDatum = await this.getSettingsUtxoDatum();
    args.protocolFees =
      this.datumBuilder.protocolFeesFromSettingsDatum(settingsDatum);
    return super.mintPool(args);
  }
}
