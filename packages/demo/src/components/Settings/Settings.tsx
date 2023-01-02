import {
  ESupportedTxBuilders,
  ESupportedWallets,
  SundaeSDK,
  TTxBuilderLoader,
  Utils,
} from "@sundae/sdk-core";
import { Blockfrost } from "lucid-cardano";
import { FC, useState, useEffect } from "react";

import { useAppState } from "../../state/context";

const SelectBuilderOption: FC<{ slug: string; name: string }> = ({
  slug,
  name,
}) => <option value={slug}>{name}</option>;

const SelectBuilder: FC = () => {
  const { setSDK } = useAppState();
  const [builderLib, setBuilderLib] = useState<ESupportedTxBuilders>();

  const handleTxBuilderLoaderSelect = (key: ESupportedTxBuilders) => {
    setBuilderLib(key);
  };

  useEffect(() => {
    let loader: TTxBuilderLoader;
    switch (builderLib) {
      case "mesh":
        loader = Utils.makeMeshLoader({
          wallet: ESupportedWallets.Eternl,
        });
        break;
      case "lucid":
        loader = Utils.makeLucidLoader({
          provider: new Blockfrost(
            "https://cardano-preview.blockfrost.io/api/v0/",
            // @ts-ignore
            window.__APP_CONFIG.blockfrostAPI
          ),
          network: "Preview",
        });
        break;
      default:
        setSDK(undefined);
        return;
    }

    setSDK(
      new SundaeSDK({
        TxBuilderLoader: loader,
        Network: "Preview",
        wallet: ESupportedWallets.Eternl,
      })
    );
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
            handleTxBuilderLoaderSelect(e.target.value as ESupportedTxBuilders)
          }
        >
          <SelectBuilderOption slug="undefined" name="None" />
          {Object.entries(ESupportedTxBuilders).map(([name, key]) => (
            <SelectBuilderOption key={key} slug={key} name={name} />
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectBuilder;
