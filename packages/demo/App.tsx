import { FC, StrictMode, useCallback } from "react";
import { useMemo } from "react";
import SundaeSDK, {
  ESupportedTxBuilders,
  TTxBuilderLoader,
} from "@sundae/sdk-js";
import { useState } from "react";

export const App: FC = () => {
  const [builderLib, setBuilderLib] = useState<ESupportedTxBuilders>();

  const handleTxBuilderLoaderSelect = (key: ESupportedTxBuilders) => {
    setBuilderLib(key);
  };

  const sdk = useMemo(() => {
    let loader: TTxBuilderLoader;
    switch (builderLib) {
      case "mesh":
        loader = {
          type: ESupportedTxBuilders.Mesh,
          loader: () =>
            import("@meshsdk/core").then(({ BrowserWallet }) =>
              BrowserWallet.enable("eternl")
            ),
        };
        break;
      default:
      case "lucid":
        loader = {
          type: ESupportedTxBuilders.Lucid,
          loader: () =>
            import("lucid-cardano").then(({ Lucid, Blockfrost }) =>
              Lucid.new(
                new Blockfrost(
                  "https://cardano-preview.blockfrost.io/api/v0/",
                  // @ts-ignore
                  window.__APP_CONFIG.blockfrostAPI
                ),
                "Preview"
              )
            ),
        };
    }
    return new SundaeSDK({
      TxBuilderLoader: loader,
      Network: "Preview",
    });
  }, [builderLib]);

  console.log(sdk);

  const handleSwap = useCallback(async () => {
    if (!sdk) {
      return;
    }

    const builder = await sdk.build();
  }, [sdk]);

  return (
    <div className="flex gap-10">
      <div className="w-3/4 p-4">
        <p>Select preferred Tx Builder</p>
        <select
          onChange={(e) =>
            handleTxBuilderLoaderSelect(e.target.value as ESupportedTxBuilders)
          }
        >
          {Object.entries(ESupportedTxBuilders).map(([name, key]) => (
            <option value={key}>{name}</option>
          ))}
        </select>
        <button onClick={handleSwap}>Build Tx</button>
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
