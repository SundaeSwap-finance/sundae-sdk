import { ITxBuilderFees } from "@sundaeswap/core";
import { TTasteTestFees } from "@sundaeswap/taste-test";
import { Dispatch, FC, SetStateAction, useState } from "react";

import {
  SundaeComponentsProvider,
  SwapComponent,
} from "@sundaeswap/components";
import { useAppState } from "../../state/context";
import Button from "../Button";
import Actions from "./Actions";

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

  return (
    <div className="p-4">
      <Button onClick={() => setUseWidgets((prev) => !prev)} loading={false}>
        Toggle UI
      </Button>
      {useWidgets ? (
        <div className="flex justify-between">
          {SDK && (
            <SundaeComponentsProvider sdk={SDK}>
              <SwapComponent />
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
