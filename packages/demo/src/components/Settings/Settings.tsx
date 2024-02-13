import {
  ETxBuilderType,
  ISundaeSDKOptions,
  QueryProviderSundaeSwapLegacy,
  SundaeSDK,
} from "@sundaeswap/core";
import { Blockfrost, Lucid } from "lucid-cardano";
import { FC, useEffect, useState } from "react";

import { useAppState } from "../../state/context";

type TSupportedTxBuilders = "lucid" | "mesh";

const SelectBuilderOption: FC<{
  builder: TSupportedTxBuilders;
  name: string;
}> = ({ builder, name }) => <option value={builder}>{name}</option>;

const SelectBuilder: FC = () => {
  const { setSDK, useV3Contracts } = useAppState();
  const [builderLib, setBuilderLib] = useState<TSupportedTxBuilders>("lucid");

  const handleTxBuilderLoaderSelect = (key: TSupportedTxBuilders) => {
    setBuilderLib(key);
  };

  useEffect(() => {
    (async () => {
      let sdk: SundaeSDK | undefined = undefined;
      switch (builderLib) {
        case "lucid":
          const lucidInstance = await Lucid.new(
            new Blockfrost(
              "https://cardano-preview.blockfrost.io/api/v0/",
              // @ts-ignore
              window.__APP_CONFIG.blockfrostAPI
            ),
            "Preview"
          );

          const options: ISundaeSDKOptions = {
            customQueryProvider: !useV3Contracts
              ? new QueryProviderSundaeSwapLegacy("preview")
              : undefined,
            wallet: {
              name: "eternl",
              network: "preview",
              builder: {
                lucid: lucidInstance,
                type: ETxBuilderType.LUCID,
              },
            },
          };

          sdk = new SundaeSDK(options);
          break;
      }

      setSDK(sdk);
    })();
  }, [builderLib, setSDK, useV3Contracts]);

  return (
    <div className="container flex gap-10">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold text-white">
          Current TxBuilder Type
        </h2>
        <select
          className="mr-4 w-full rounded-md bg-slate-800 px-4 py-2"
          value={builderLib}
          onChange={(e) =>
            handleTxBuilderLoaderSelect(e.target.value as TSupportedTxBuilders)
          }
        >
          <option value="undefined">None</option>
          <SelectBuilderOption builder="lucid" name="Lucid" />
          <SelectBuilderOption builder="mesh" name="Mesh" />
        </select>
      </div>
    </div>
  );
};

export default SelectBuilder;
