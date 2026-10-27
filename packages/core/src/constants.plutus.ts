import { Void } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";

/**
 * Constants that are Plutus data, and so need the Cardano serialization
 * library. Kept out of `constants.ts` so that the plain constants, and
 * `@sundaeswap/core/utilities` which re-exports them, don't pull that library
 * into an app's first load.
 */

/** The `Void` datum as bytes, used as the empty `extension` in v3 datums. */
export const VOID_BYTES = Core.PlutusData.newBytes(
  Buffer.from(Void().toCbor(), "hex"),
);
