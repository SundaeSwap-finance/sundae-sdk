import { DatumBuilderAbstractCondition } from "./DatumBuilderCondition.abstract.class.js";
import { TxBuilderAbstractV3 } from "./TxBuilderAbstract.V3.class.js";

/**
 * The main class by which TxBuilder classes for condition pools are extended.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilderAbstractCondition extends TxBuilderAbstractV3 {
  abstract datumBuilder: DatumBuilderAbstractCondition;
}
