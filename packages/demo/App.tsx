import { FC, StrictMode, useCallback } from "react";
import { useMemo } from "react";
import SundaeSDK from "@sundae/sdk-js";

export const App: FC = () => {
  const sdk = useMemo(() => {
    return new SundaeSDK({
      TxBuilderLoader: async () => {
        return await import("lucid-cardano").then(({ Lucid, Blockfrost }) =>
          Lucid.new(
            new Blockfrost(
              "https://cardano-preview.blockfrost.io/api/v0/",
              // @ts-ignore
              window.__APP_CONFIG.blockfrostAPI
            ),
            "Preview"
          )
        );
      },
      Network: "Preview",
    });
  }, []);

  const handleSwap = useCallback(async () => {
    if (!sdk) {
      return;
    }

    await sdk.build();

    // try {
    //   const swapArgs: IGetSwapArgs = {
    //     submit: true,
    //     poolIdent: "00",
    //     asset: {
    //       amount: 20n,
    //       metadata: {
    //         assetID:
    //           "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
    //         decimals: 6,
    //       },
    //     },
    //   };

    //   setSwapping(true);
    //   const txHash = await sdk.swap(swapArgs);
    //   console.log(txHash);
    //   setSwapping(false);
    // } catch (e) {
    //   console.log(e);
    //   setSwapping(false);
    // }
  }, []);

  return (
    <div className="flex gap-10">
      <div className="w-3/4 p-4">
        <button onClick={handleSwap}>Start Building</button>
      </div>
    </div>
  );
};

export const Root = () => {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

export default Root;
