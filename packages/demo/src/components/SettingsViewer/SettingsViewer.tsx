import { FC } from "react";
import ReactJson from "react-json-view";
import { ITxBuilderBaseOptions } from "@sundaeswap/sdk-core";
import { ITxBuilderLucidOptions } from "@sundaeswap/sdk-core/extensions";

import { useAppState } from "../../state/context";

const SettingsViewer: FC = () => {
  const { SDK } = useAppState();

  if (!SDK) {
    return null;
  }

  const options: ITxBuilderBaseOptions = {
    ...SDK.build().options,
    blockfrost: {
      ...SDK.build().options.blockfrost,
      apiKey: "HIDDEN",
    },
    minLockAda: SDK.build().options.minLockAda.toString(),
    referral: {
      destination:
        SDK.build<ITxBuilderLucidOptions>().options.referral?.destination,
      payment:
        SDK.build<ITxBuilderLucidOptions>().options.referral?.payment.amount.toString(),
    },
  };

  return (
    <div className="rounded-md p-4">
      <h4 className="mb-4 text-lg font-bold text-white">
        Class Object Details
      </h4>
      <ReactJson
        theme="embers"
        enableClipboard={false}
        collapseStringsAfterLength={20}
        style={{
          padding: 8,
          borderRadius: 8,
          border: "1px solid #555",
        }}
        src={{
          builderOptions: options,
        }}
      />
    </div>
  );
};

export default SettingsViewer;
