import {
  ETxBuilderType,
  ISundaeSDKOptions,
  QueryProviderSundaeSwapLegacy,
  SundaeSDK,
} from "@sundaeswap/core";
import { FC, useEffect } from "react";

import { useAppState } from "../../state/context";

const SelectBuilderOption: FC<{
  builder: ETxBuilderType;
  name: string;
}> = ({ builder, name }) => <option value={builder}>{name}</option>;

const SelectBuilder: FC = () => {
  const { setSDK, setBuilderLib, builderLib, useV3Contracts } = useAppState();

  const handleTxBuilderLoaderSelect = (key: ETxBuilderType) => {
    setBuilderLib(key);
  };

  useEffect(() => {
    (async () => {
      let sdk: SundaeSDK | undefined = undefined;
      switch (builderLib) {
        case ETxBuilderType.BLAZE: {
          const { Blaze, Blockfrost, WebWallet } = await import(
            "@blaze-cardano/sdk"
          );
          const api = await window.cardano.eternl.enable();
          const blazeInstance = await Blaze.from(
            new Blockfrost({
              network: "cardano-preview",
              // @ts-ignore
              projectId: window.__APP_CONFIG.blockfrostAPI,
            }),
            new WebWallet(api)
          );

          const options: ISundaeSDKOptions = {
            customQueryProvider: !useV3Contracts
              ? new QueryProviderSundaeSwapLegacy("preview")
              : undefined,
            wallet: {
              name: "eternl",
              network: "preview",
              builder: {
                blaze: blazeInstance,
                type: ETxBuilderType.BLAZE,
              },
            },
          };

          sdk = new SundaeSDK(options);
          break;
        }
        default:
        case ETxBuilderType.LUCID: {
          const { Lucid, Blockfrost } = await import("lucid-cardano");
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
            handleTxBuilderLoaderSelect(e.target.value as ETxBuilderType)
          }
        >
          <option value="undefined">None</option>
          <SelectBuilderOption builder={ETxBuilderType.LUCID} name="Lucid" />
          <SelectBuilderOption builder={ETxBuilderType.BLAZE} name="Blaze" />
        </select>
      </div>
    </div>
  );
};

export default SelectBuilder;
