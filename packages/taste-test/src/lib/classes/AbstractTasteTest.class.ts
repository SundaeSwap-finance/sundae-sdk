import type { ITxBuilder, ITxBuilderSign } from "@sundaeswap/core";
import type { Lucid } from "lucid-cardano";

import { IDepositArgs } from "../../@types";

export abstract class AbstractTasteTest {
  abstract lucid: Lucid;

  abstract deposit(args: IDepositArgs): Promise<ITxBuilder>;
}
