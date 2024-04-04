import { DatumBuilder, TSupportedNetworks } from "@sundaeswap/core";

/**
 * The Lucid representation of a DatumBuilder. The primary purpose of this class
 * is to encapsulate the accurate building of valid datums, which should be attached
 * to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
 * smart contracts. These datums ensure accurate business logic and the conform to the
 * specs as defined in the SundaeSwap smart contracts.
 */
export class DatumBuilderLucid implements DatumBuilder {
  constructor(public network: TSupportedNetworks) {}
}
