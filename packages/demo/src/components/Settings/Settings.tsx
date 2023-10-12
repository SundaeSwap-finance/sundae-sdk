import { SundaeSDK } from "@sundaeswap/core";
import { FC, useEffect, useState } from "react";

import { ITxBuilderLucidOptions } from "@sundaeswap/core/extensions";
import { useAppState } from "../../state/context";

type TSupportedTxBuilders = "lucid" | "mesh";

const SelectBuilderOption: FC<{
  builder: TSupportedTxBuilders;
  name: string;
}> = ({ builder, name }) => <option value={builder}>{name}</option>;

const SelectBuilder: FC = () => {
  const { setSDK } = useAppState();
  const [builderLib, setBuilderLib] = useState<TSupportedTxBuilders>("lucid");

  const handleTxBuilderLoaderSelect = (key: TSupportedTxBuilders) => {
    setBuilderLib(key);
  };

  useEffect(() => {
    (async () => {
      let sdk: SundaeSDK | undefined = undefined;
      switch (builderLib) {
        // case "mesh":
        //   sdk = new SundaeSDK(
        //     TxBuilderMesh.new({
        //       wallet: ESupportedWallets.Eternl,
        //       network: "preview",
        //     })
        //   );
        //   break;
        case "lucid":
          const { TxBuilderLucid, ProviderSundaeSwap } = await import(
            "@sundaeswap/core/extensions"
          );

          const options: ITxBuilderLucidOptions = {
            providerType: "blockfrost",
            blockfrost: {
              url: "https://cardano-preview.blockfrost.io/api/v0/",
              // @ts-ignore
              apiKey: window.__APP_CONFIG.blockfrostAPI,
            },
            network: "preview",
            wallet: "eternl",
          };

          sdk = new SundaeSDK(
            new TxBuilderLucid(options, new ProviderSundaeSwap("preview"))
          );

          break;
      }

      setSDK(sdk);
    })();
  }, [builderLib, setSDK]);

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
