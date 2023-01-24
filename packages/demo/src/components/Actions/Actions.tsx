import { AssetAmount, IPoolQuery, OrderAddresses } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import ReactJson from "react-json-view";
import { useAppState } from "../../state/context";
import Button from "../Button";

const poolQuery: IPoolQuery = {
  pair: [
    "",
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
  ],
  fee: "0.30",
};

const defaultOrderAddresses: OrderAddresses = {
  DestinationAddress: {
    address:
      "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32",
  },
};

export const Actions: FC = () => {
  const { SDK } = useAppState();
  const [swapping, setSwapping] = useState(false);
  const [reverseSwapping, setReverseSwapping] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [cbor, setCBOR] = useState("");

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);
      await SDK.swap({
        pool,
        orderAddresses: defaultOrderAddresses,
        suppliedAsset: {
          assetId:
            "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
          amount: new AssetAmount(20000000n, 6),
        },
      }).then(({ cbor }) => {
        setCBOR(cbor);
      });
    } catch (e) {
      console.log(e);
    }

    setSwapping(false);
  }, [SDK]);

  const handleReverseSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setReverseSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);
      await SDK.swap({
        pool,
        orderAddresses: defaultOrderAddresses,
        suppliedAsset: {
          assetId: "",
          amount: new AssetAmount(25000000n, 6),
        },
      }).then(({ cbor }) => {
        setCBOR(cbor);
      });
    } catch (e) {
      console.log(e);
    }

    setReverseSwapping(false);
  }, [SDK]);

  const handleDeposit = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setDepositing(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);
      await SDK.deposit({
        orderAddresses: defaultOrderAddresses,
        pool,
        suppliedAssets: [
          {
            assetId: "",
            amount: new AssetAmount(25000000n, 6),
          },
          {
            assetId:
              "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
            amount: new AssetAmount(20000000n, 6),
          },
        ],
      }).then(({ cbor }) => {
        setCBOR(cbor);
      });
    } catch (e) {
      console.log(e);
    }

    setDepositing(false);
  }, [SDK]);

  if (!SDK) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-4 text-lg font-bold text-white">
        SundaeSwap Protocol Actions
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <Button onClick={handleSwap} loading={swapping}>
          Swap tINDY for tADA
        </Button>
        <Button onClick={handleReverseSwap} loading={reverseSwapping}>
          Swap tADA for tINDY
        </Button>
        <Button onClick={handleDeposit} loading={depositing}>
          Deposit tADA/tINDY
        </Button>
      </div>
      <h2 className="mb-4 text-lg font-bold text-white">CBOR</h2>
      <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
        {cbor}
      </div>
    </div>
  );
};

export default Actions;
