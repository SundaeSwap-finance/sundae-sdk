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
<<<<<<< HEAD
  const { setSDK, setBuilderLib, builderLib, useV3Contracts } = useAppState();
=======
  const { setSDK, useV3Contracts } = useAppState();
  const [builderLib, setBuilderLib] = useState<TSupportedTxBuilders>("lucid");
  const [network, setNetwork] = useState<0 | 1>(0);
>>>>>>> f79bdb010346a6b2b7fb57a4dbbd70054c785826

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
              "https://cardano-mainnet.blockfrost.io/api/v0/",
              // @ts-ignore
              window.__APP_CONFIG.blockfrostAPI
            ),
            network ? "Mainnet" : "Preview"
          );

          const options: ISundaeSDKOptions = {
            customQueryProvider: !useV3Contracts
              ? new QueryProviderSundaeSwapLegacy(
                  network ? "mainnet" : "preview"
                )
              : undefined,
            wallet: {
              name: "eternl",
              network: network ? "mainnet" : "preview",
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
  }, [builderLib, setSDK, useV3Contracts, network]);

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
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold text-white">Network</h2>
        <select
          className="mr-4 w-full rounded-md bg-slate-800 px-4 py-2"
          value={network}
          onChange={(e) => setNetwork(Number(e.target.value) as 0 | 1)}
        >
          <option value="0">Preview</option>
          <option value="1">Mainnet</option>
        </select>
      </div>
    </div>
  );
};

export default SelectBuilder;
