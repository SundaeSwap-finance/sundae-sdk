import {
  ADA_ASSET_ID,
  IPoolByIdentQuery,
  type IPoolByPairQuery,
  type ITxBuilderFees,
} from "@sundaeswap/core";
import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import type { TTasteTestFees } from "@sundaeswap/taste-test";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ReactJson from "react-json-view";

import { V3_CONTRACT_POOL_TINDY } from "../../constants";
import { useAppState } from "../../state/context";
import { CancelSwap } from "./modules/CancelSwap";
import { CreatePool } from "./modules/CreatePool";
import { Deposit } from "./modules/Deposit";
import { Lock } from "./modules/LockAssets";
import { Migrate } from "./modules/MigrateV1LiquidityToV3";
import { OrderRouting } from "./modules/OrderRouting";
import { SwapAB } from "./modules/SwapAB";
import { SwapBA } from "./modules/SwapBA";
import { Unlock } from "./modules/UnlockAssets";
import { UnlockV1 } from "./modules/UnlockAssetsV1";
import { UpdateSwap } from "./modules/UpdateSwap";
import { Withdraw } from "./modules/Withdraw";
import { Zap } from "./modules/Zap";

export const poolQuery: IPoolByPairQuery = {
  pair: ["", PREVIEW_DATA.pools.v1.assetB.assetId],
  fee: "0.30",
};

export const newPoolQuery: IPoolByIdentQuery = {
  ident: V3_CONTRACT_POOL_TINDY.ident,
};

interface ICBOR {
  cbor: string;
  hash?: string;
}

export interface IActionArgs {
  submit?: boolean;
  setCBOR: Dispatch<SetStateAction<ICBOR>>;
  setFees: Dispatch<
    SetStateAction<ITxBuilderFees | TTasteTestFees | undefined>
  >;
}

export const Actions: FC = () => {
  const {
    SDK,
    useReferral,
    setUseReferral,
    useV3Contracts,
    setUseV3Contracts,
  } = useAppState();
  const [cbor, setCBOR] = useState<ICBOR>({
    cbor: "",
  });
  const [fees, setFees] = useState<ITxBuilderFees | TTasteTestFees>();
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
        <div className="col-span-2 flex items-center justify-center gap-2">
          <h4 className="w-12">DEX </h4>
          <hr className="my-10 w-full" />
        </div>
        <div className="col-span-2 flex items-center justify-start gap-2">
          <label htmlFor="v3Contracts">Use V3 Contracts?</label>
          <input
            id="v3Contracts"
            type="checkbox"
            checked={useV3Contracts}
            onChange={(e) => setUseV3Contracts(e.target.checked)}
          />
        </div>
        <SwapAB setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <SwapBA setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Deposit setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Withdraw setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Zap setCBOR={setCBOR} setFees={setFees} submit={submit} />
        <UpdateSwap setCBOR={setCBOR} setFees={setFees} submit={submit} />
        <CancelSwap setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Migrate setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <CreatePool setFees={setFees} setCBOR={setCBOR} submit={submit} />

        <div className="col-span-2 flex items-center justify-between gap-2">
          <h4 className="w-32">Yield Farming</h4>
          <hr className="my-10 w-full" />
        </div>
        <Lock setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Unlock setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <UnlockV1 setFees={setFees} setCBOR={setCBOR} submit={submit} />

        <div className="col-span-2 flex items-center justify-between gap-2">
          <h4 className="w-24">Taste Tests</h4>
          <hr className="my-10 w-full" />
        </div>
        {/* <DepositTasteTest setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <UpdateTasteTest setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <WithdrawTasteTest
          setFees={setFees}
          setCBOR={setCBOR}
          submit={submit}
        /> */}
        <div className="col-span-2 flex items-center justify-between gap-2">
          <h4 className="w-32">Order Routing</h4>
          <hr className="my-10 w-full" />
        </div>
        <OrderRouting setFees={setFees} setCBOR={setCBOR} submit={submit} />
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
              foldFee:
                (fees as TTasteTestFees).foldFee?.amount.toString() ?? "0",
              penalty:
                (fees as TTasteTestFees).penaltyFee?.amount.toString() ?? "0",
              referral: {
                assetId: fees.referral?.metadata?.assetId ?? ADA_ASSET_ID,
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
