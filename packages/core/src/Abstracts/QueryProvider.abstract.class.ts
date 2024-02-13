import type { TUTXO } from "../@types/datumbuilder.js";
import type { IPoolData } from "../@types/queryprovider.js";

/**
 * The base Provider interface by which you can implement custom Provider classes.
 *
 * @group Extension Builders
 */
export abstract class QueryProvider {
  abstract baseUrl: string;

  /**
   * Finds a matching pool on the SundaeSwap protocol.
   *
   * @param query The query object as defined by the implementing class.
   * @returns {Promise<IPoolData>} Returns the queried pool's data.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract findPoolData: (query: any) => Promise<IPoolData>;

  /**
   * Finds the associated UTXO data of an open order.
   *
   * @param utxo The transaction hash and index of the open order in the escrow contract.
   */
  abstract findOpenOrderDatum: (
    utxo: TUTXO
  ) => Promise<{ datum: string; datumHash: string }>;
}
