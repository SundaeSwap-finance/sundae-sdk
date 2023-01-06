import { AssetAmount, IPoolQuery } from "@sundae/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../state/context";
import Button from "../Button";

const poolQuery: IPoolQuery = {
  pair: [
    "",
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
  ],
  fee: "0.30",
};

export const Actions: FC = () => {
  const { SDK } = useAppState();
  const [swapping, setSwapping] = useState(false);
  const [reverseSwapping, setReverseSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setSwapping(true);
    const txHash = await SDK.swap({
      poolQuery,
      suppliedAsset: {
        assetID:
          "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
        amount: new AssetAmount(20n, 6),
      },
      receiverAddress:
        "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32",
    }).then(({ submit }) => submit());

    console.log(txHash);
    setSwapping(false);
  }, [SDK]);

  const handleReverseSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setReverseSwapping(true);
    const txHash = await SDK.swap({
      poolQuery,
      suppliedAsset: {
        assetID: "",
        amount: new AssetAmount(25n, 6),
      },
      receiverAddress:
        "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32",
    }).then(({ submit }) => submit());

    console.log(txHash);
    setReverseSwapping(false);
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
      </div>
    </div>
  );
};

export default Actions;
