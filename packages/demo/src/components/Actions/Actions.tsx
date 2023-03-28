import { IPoolQuery, ITxBuilderFees } from "@sundaeswap/sdk-core";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ReactJson from "react-json-view";
import { useAppState } from "../../state/context";
import { Deposit } from "./modules/Deposit";
import { SwapAB } from "./modules/SwapAB";
import { SwapBA } from "./modules/SwapBA";
import { Withdraw } from "./modules/Withdraw";
import { Zap } from "./modules/Zap";

export const poolQuery: IPoolQuery = {
  pair: [
    "",
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
  ],
  fee: "0.30",
};

interface CBOR {
  cbor: string;
  hash?: string;
}

export interface ActionArgs {
  submit?: boolean;
  setCBOR: Dispatch<SetStateAction<CBOR>>;
  setFees: Dispatch<SetStateAction<ITxBuilderFees | undefined>>;
}

export const Actions: FC = () => {
  const { SDK } = useAppState();
  const [cbor, setCBOR] = useState<CBOR>({
    cbor: "",
  });
  const [fees, setFees] = useState<ITxBuilderFees>();
  const [submit, setSubmit] = useState(false);

  if (!SDK) {
    return null;
  }

  // const tempCancelOrder = async () => {
  //   const utxo = {
  //     hash: "3f8ffa9fe490b43bd286e73a7c62e951c3b1c6729a65751d87fce9faba4f8cd6",
  //     index: 0,
  //   };

  //   const { datum, datumHash } = await SDK.query().findOpenOrderDatum(utxo);

  //   if (datum) {
  //     const hash = await SDK.cancel({
  //       datum,
  //       datumHash,
  //       utxo,
  //       address:
  //         "addr_test1qz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsemxyd6",
  //     });

  //     console.log(hash);
  //   }
  // };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-4 text-lg font-bold text-white flex items-center justify-between">
        SundaeSwap Protocol Actions
        <div className="flex items-center justify-center gap-2">
          <label htmlFor="submitTx">Submit to Wallet?</label>
          <input
            id="submitTx"
            type="checkbox"
            checked={submit}
            onChange={(e) => setSubmit(e.target.checked)}
          />
        </div>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <SwapAB setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <SwapBA setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Deposit setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Withdraw setFees={setFees} setCBOR={setCBOR} submit={submit} />
        {/* <button onClick={tempCancelOrder}>Cancel Order</button> */}
        <Zap setCBOR={setCBOR} setFees={setFees} submit={submit} />
      </div>
      {cbor.hash && (
        <>
          <h2 className="mb-4 text-lg font-bold text-white">Tx Hash</h2>
          <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
            {cbor.hash}
          </div>
        </>
      )}
      <h2 className="mb-4 text-lg font-bold text-white">CBOR</h2>
      <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
        {cbor.cbor}
      </div>
      <h2 className="mb-4 text-lg font-bold text-white">Fees</h2>
      <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
        {fees && (
          <ReactJson
            theme="embers"
            enableClipboard={false}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #555",
            }}
            src={{
              cardanoTxFee: fees.cardanoTxFee.getAmount().toString(),
              scooperFee: fees.scooperFee.getAmount().toString(),
              deposit: fees.deposit.getAmount().toString(),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Actions;
