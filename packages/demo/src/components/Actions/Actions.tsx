import { FC, useCallback, useState } from "react";
import { useAppState } from "../../state/context";
import Button from "../Button";

export const Actions: FC = () => {
  const { SDK } = useAppState();
  const [swapping, setSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    try {
      setSwapping(true);
      const txBuilder = await SDK.build().swap({
        ident: "03",
        providedAsset: {
          amount: 20n,
          name: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
        },
        receiverAddress:
          "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32",
      });
      const res = await txBuilder.complete();
      console.log(res);
    } catch (e) {
      console.log(e);
    }

    setSwapping(false);
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
      </div>
    </div>
  );
};

export default Actions;
