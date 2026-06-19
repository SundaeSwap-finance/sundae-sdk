import type { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilderAbstract } from "../Abstracts/DatumBuilder.abstract.class.js";

/**
 * Datum + redeemer builder for sundae-v4 transactions.
 *
 * Unlike v1/v3 — where one Order datum shape served the whole protocol —
 * v4 splits intent into a list of (`module_hash`, `data`) constraints
 * attached to a generic `OrderDatum`. The basic / swap / strategy
 * methods on this class each construct one of those constraint entries
 * and assemble the surrounding OrderDatum.
 *
 * Phase 1 ships the class skeleton only; the concrete encoders land in
 * Phase 2 (ported from sundae-v4's CLI helpers).
 */
export class DatumBuilderV4 implements DatumBuilderAbstract {
  /** The current network id. */
  public network: TSupportedNetworks;

  constructor(network: TSupportedNetworks) {
    this.network = network;
  }
}
