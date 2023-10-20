import { IPoolQuery, ITxBuilderFees } from "@sundaeswap/core";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ReactJson from "react-json-view";
import { useAppState } from "../../state/context";
import { Deposit } from "./modules/Deposit";
import { DepositTasteTest } from "./modules/DepositTasteTest";
import { Lock } from "./modules/LockAssets";
import { SwapAB } from "./modules/SwapAB";
import { SwapBA } from "./modules/SwapBA";
import { Unlock } from "./modules/UnlockAssets";
import { UpdateSwap } from "./modules/UpdateSwap";
import { UpdateTasteTest } from "./modules/UpdateTasteTest";
import { Withdraw } from "./modules/Withdraw";
import { WithdrawTasteTest } from "./modules/WithdrawTasteTest";
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
  const { SDK, useReferral, setUseReferral } = useAppState();
  const [cbor, setCBOR] = useState<CBOR>({
    cbor: "",
  });
  const [fees, setFees] = useState<ITxBuilderFees>();
  const [submit, setSubmit] = useState(false);

  if (!SDK) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-4 text-lg font-bold text-white flex items-center justify-between">
        SundaeSwap Protocol Actions
        <div className="flex items-center justify-center gap-2">
          <div>
            <label htmlFor="submitTx">Submit to Wallet?</label>
            <input
              id="submitTx"
              type="checkbox"
              checked={submit}
              onChange={(e) => setSubmit(e.target.checked)}
            />
          </div>
          <div>
            <label htmlFor="referralFee">Add Referral Fee?</label>
            <input
              id="referralFee"
              type="checkbox"
              checked={useReferral}
              onChange={(e) => setUseReferral(e.target.checked)}
            />
          </div>
        </div>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <SwapAB setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <SwapBA setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Deposit setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Withdraw setFees={setFees} setCBOR={setCBOR} submit={submit} />
        {/* <button onClick={tempCancelOrder}>Cancel Order</button> */}
        <Zap setCBOR={setCBOR} setFees={setFees} submit={submit} />
        <UpdateSwap setCBOR={setCBOR} setFees={setFees} submit={submit} />
        <Lock setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Unlock setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <div className="col-span-2 flex items-center justify-between gap-2">
          <h4 className="w-24">Taste Tests</h4>
          <hr className="my-10 w-full" />
        </div>
        <DepositTasteTest setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <UpdateTasteTest setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <WithdrawTasteTest
          setFees={setFees}
          setCBOR={setCBOR}
          submit={submit}
        />
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
              cardanoTxFee: fees.cardanoTxFee?.amount.toString(),
              scooperFee: fees.scooperFee.amount.toString(),
              deposit: fees.deposit.amount.toString(),
              foldFee: fees.foldFee?.amount.toString() ?? "0",
              referral: {
                assetId: fees.referral?.metadata.assetId ?? "",
                amount: fees.referral?.amount.toString() ?? "0",
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Actions;
