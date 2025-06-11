import { Core } from "@blaze-cardano/sdk";

/**
 * Exported primarily for type controls.
 */
export abstract class DatumBuilderAbstractCondition {
  abstract buildConditionDatum(args: unknown): Core.PlutusData;
}
