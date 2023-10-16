import type { ITxBuilder } from "@sundaeswap/core";
import type { Lucid } from "lucid-cardano";

import { IDepositArgs, IUpdateArgs, IWithdrawArgs } from "../../@types";

export abstract class AbstractTasteTest {
  abstract lucid: Lucid;

  abstract deposit(args: IDepositArgs): Promise<ITxBuilder>;
  abstract update(args: IUpdateArgs): Promise<ITxBuilder>;
  abstract withdraw(args: IWithdrawArgs): Promise<ITxBuilder>;
}
