import { FC, StrictMode, useCallback } from "react";
import { SundaeSDK } from "@sundae/sdk";
import { MeshProvider, CardanoWallet, useWallet, useNetwork } from "@martifylabs/mesh-react";
import { useMemo } from "react";

export const App: FC = () => {
  const network = useNetwork();
  const { wallet } = useWallet();
  console.log(network)
  const sdk = useMemo(() => new SundaeSDK(wallet, network === 0 ? "Preview" : "Mainnet"), [wallet, network]);
  
  const handleSwap = useCallback(async () => {
    console.log(sdk.network)
    try {
      await sdk.swap({
        poolIdent: "03",
        asset: {
          amount: 20n,
          metadata: {
            assetID:
              "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145",
            decimals: 6,
          },
        },
        walletHash: await wallet.getUsedAddress(),
      });
    } catch (e) {
      console.log(e);
    }
  }, [wallet, network]);
  return (
    <div className="flex gap-10">
      <div className="m-4 w-1/4 border border-gray-400 p-4">
        <h4>
          <CardanoWallet />
        </h4>
      </div>
      <div className="w-3/4 p-4">
        <button onClick={handleSwap}>Swap</button>
      </div>
    </div>
  );
};

export const Root = () => {
  return (
    <StrictMode>
      <MeshProvider>
        <App />
      </MeshProvider>
    </StrictMode>
  );
};

export default Root;
