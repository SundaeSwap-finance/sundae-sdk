import { FC } from "react";
import ReactJson from "react-json-view";
import { useAppState } from "../../state/context";

const SettingsViewer: FC = () => {
  const { SDK } = useAppState();

  if (!SDK) {
    return null;
  }

  const options = {
    ...SDK.build().options,
    blockfrost: {
      ...SDK.build().options.blockfrost,
      apiKey: "HIDDEN",
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
