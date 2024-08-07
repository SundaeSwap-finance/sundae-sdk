import { IPoolData, ITxBuilderFees } from "@sundaeswap/core";
import { TTasteTestFees } from "@sundaeswap/taste-test";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

import {
  SundaeComponentsProvider,
  SwapComponent,
} from "@sundaeswap/components";
import { useAppState } from "../../state/context";
import Button from "../Button";
import Actions, { poolQuery } from "./Actions";

interface ICBOR {
  cbor: string;
  hash?: string;
}

export interface IActionArgs {
  cbor: ICBOR;
  setCBOR: Dispatch<SetStateAction<ICBOR>>;
  fees: ITxBuilderFees | TTasteTestFees | undefined;
  setFees: Dispatch<
    SetStateAction<ITxBuilderFees | TTasteTestFees | undefined>
  >;
  submit?: boolean;
  setSubmit: Dispatch<SetStateAction<boolean>>;
}

export const Home: FC = () => {
  const { SDK } = useAppState();
  const [cbor, setCBOR] = useState<ICBOR>({
    cbor: "",
  });
  const [fees, setFees] = useState<ITxBuilderFees | TTasteTestFees>();
  const [submit, setSubmit] = useState(false);
  const [useWidgets, setUseWidgets] = useState(false);
  const [pool, setPool] = useState<IPoolData>();

  useEffect(() => {
    if (!SDK) {
      return;
    }

    (async () => {
      const pool = await SDK.query().findPoolData(poolQuery);
      pool && setPool(pool);
    })();
  }, [SDK, setPool]);

  return (
    <div className="p-4">
      <Button onClick={() => setUseWidgets((prev) => !prev)} loading={false}>
        Toggle UI
      </Button>
      {useWidgets ? (
        <div className="flex justify-between">
          {SDK && pool && (
            <SundaeComponentsProvider sdk={SDK}>
              <SwapComponent
                settings={{
                  pool,
                }}
              />
            </SundaeComponentsProvider>
          )}
        </div>
      ) : (
        <Actions
          cbor={cbor}
          fees={fees}
          setCBOR={setCBOR}
          setFees={setFees}
          setSubmit={setSubmit}
          submit={submit}
        />
      )}
    </div>
  );
};
