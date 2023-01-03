import { FC, useCallback } from "react";
import { useAppState } from "../../state/context";
import Button from "../Button";

export const Actions: FC = () => {
  const { SDK } = useAppState();

  const handleSwap = useCallback(() => {
    if (!SDK) {
      return;
    }

    const txBuilder = SDK.build();
  }, [SDK]);

  if (!SDK) {
    return null;
  }

  return (
    <div className="flex-col-gap-4 flex">
      <Button onClick={handleSwap}>Swap RBERRY for tADA</Button>
    </div>
  );
};

export default Actions;
