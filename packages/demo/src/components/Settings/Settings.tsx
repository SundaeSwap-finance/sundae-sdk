import {
  ProviderSundaeSwap,
  SundaeSDK,
  TxBuilderLucid,
} from "@sundaeswap/sdk-core";
import { FC, useState, useEffect } from "react";
import { useAppState } from "../../state/context";

type TSupportedTxBuilders = "lucid" | "mesh";

const SelectBuilderOption: FC<{
  builder: TSupportedTxBuilders;
  name: string;
}> = ({ builder, name }) => <option value={builder}>{name}</option>;

const SelectBuilder: FC = () => {
  const { setSDK } = useAppState();
  const [builderLib, setBuilderLib] = useState<TSupportedTxBuilders>();

  const handleTxBuilderLoaderSelect = (key: TSupportedTxBuilders) => {
    setBuilderLib(key);
  };

  useEffect(() => {
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
        sdk = new SundaeSDK(
          new TxBuilderLucid(
            {
              provider: "blockfrost",
              blockfrost: {
                url: "https://cardano-preview.blockfrost.io/api/v0/",
                // @ts-ignore
                apiKey: window.__APP_CONFIG.blockfrostAPI,
              },
              network: "preview",
              wallet: "eternl",
            },
            new ProviderSundaeSwap("preview")
          )
        );

        break;
    }

    setSDK(sdk);
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
