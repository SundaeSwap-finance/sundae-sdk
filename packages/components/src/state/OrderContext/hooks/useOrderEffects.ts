import { useAdaAfterSwap } from "./useAdaAfterSwap";
import { useGivenExceedsBalance } from "./useGivenExceedsBalance";
// import { useOrderConsentI18nKey } from "./useOrderConsentI18nKey";

/**
 * This hook contains side-effects for the OrderContext.
 * It updates derived state based on the wallet balance and other app settings.
 *
 * @function
 * @returns {void}
 */
export const useOrderEffects = () => {
  useGivenExceedsBalance();
  useAdaAfterSwap();
  // useOrderConsentI18nKey();
};
