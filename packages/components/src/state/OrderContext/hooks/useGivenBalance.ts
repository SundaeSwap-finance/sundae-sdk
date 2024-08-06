import { useBalance } from "../../../hooks/useBalance.js";
import { useOrderContext } from "../context.js";

export const useGivenBalance = () => {
  const {
    state: {
      assets: { given },
    },
  } = useOrderContext();
  const { balance } = useBalance(given?.metadata);

  return {
    balance,
    loaded: Boolean(balance),
  };
};
