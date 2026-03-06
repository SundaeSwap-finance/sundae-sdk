import { TFee } from "./queryprovider.js";

/**
 * A type constant used for determining valid Cardano Network values.
 *
 * @group Utility Types
 */
export type TSupportedNetworks = "mainnet" | "preview" | "preprod";

/**
 * An interface to describe a utility function's arguments in SundaeUtils.
 */
export interface ICurrentFeeFromDecayingFeeArgs {
  endFee: TFee;
  endSlot: string;
  startFee: TFee;
  startSlot: string;
  network: TSupportedNetworks;
}
