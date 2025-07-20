import { Core } from "@blaze-cardano/sdk";
import { TConditionDatumArgs } from "../DatumBuilders/DatumBuilder.Condition.class.js";

/**
 * Exported primarily for type controls.
 */
export abstract class DatumBuilderAbstractCondition {
  abstract buildConditionDatum(args: TConditionDatumArgs): Core.PlutusData;
}
