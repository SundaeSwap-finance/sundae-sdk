import type {
  IComposedTx,
  ITxBuilderSign,
  ITxBuilderSubmit,
} from "@sundaeswap/core";
import type { Tx, TxComplete } from "lucid-cardano";
import { useCallback, useState } from "react";

export type TTransactionResponseType = IComposedTx<Tx, TxComplete>;

export const useTransaction = (
  buildFn: () => Promise<TTransactionResponseType>
) => {
  const [error, setError] = useState<string>();
  const [fees, setFees] = useState<TTransactionResponseType["fees"]>();
  const [composedTx, setComposedTx] =
    useState<ITxBuilderSign<TxComplete> | null>(null);
  const [builtTx, setBuiltTx] = useState<ITxBuilderSubmit | null>(null);

  const buildTx = useCallback(async () => {
    try {
      const { build, fees } = await buildFn();
      setFees(fees);
      setComposedTx(await build());
    } catch (e) {
      setError((e as Error).message);
    }
  }, [buildFn]);

  const signTx = useCallback(async () => {
    if (!composedTx) {
      throw new Error(
        "Could not sign the transaction because it was not built yet."
      );
    }

    setBuiltTx(await composedTx.sign());
  }, [composedTx]);

  const submitTx = useCallback(() => {
    if (!builtTx) {
      throw new Error(
        "Could not submit the transaction because it was not signed yet."
      );
    }

    return builtTx.submit();
  }, [builtTx]);

  return {
    error,
    fees,
    buildTx,
    signTx,
    submitTx,
  };
};
