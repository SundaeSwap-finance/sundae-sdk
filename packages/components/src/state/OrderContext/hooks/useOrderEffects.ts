import { useAdaAfterSwap } from "./useAdaAfterSwap.js";
import { useGivenExceedsBalance } from "./useGivenExceedsBalance.js";
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
