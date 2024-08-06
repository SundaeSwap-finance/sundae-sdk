// import { useEffect } from "react";
// import {
//   isAssetIndivisible,
//   isAssetRegistered,
// } from "../../../utils/assets.utils";
// import { OrderActions } from "../actions";
// import { useOrderContext } from "../context";

// export const useOrderConsentI18nKey = () => {
//   const { state, dispatch } = useOrderContext();
//   const {
//     assets: { given, taken },
//   } = state;

//   /**
//    * Check for asset warning (unregistered / indivisible / both)
//    */
//   useEffect(() => {
//     /* -------------------------------------------------------------------------------------------------
//      * Unregistered AND indivisible
//      * -----------------------------------------------------------------------------------------------*/
//     if (
//       (!isAssetRegistered(given?.metadata) ||
//         !isAssetRegistered(taken?.metadata)) &&
//       (isAssetIndivisible(given?.metadata) ||
//         isAssetIndivisible(taken?.metadata))
//     ) {
//       OrderActions.setOrderConsent(
//         { i18nKey: "unregisteredAndIndivisibleAsset" },
//         dispatch,
//         "OrderContext.useOrderConsentI18nKey.unregisteredAndDivisible",
//       );
//     }

//     /* -------------------------------------------------------------------------------------------------
//      * Indivisible only
//      * -----------------------------------------------------------------------------------------------*/
//     if (
//       isAssetIndivisible(given?.metadata) ||
//       isAssetIndivisible(taken?.metadata)
//     ) {
//       OrderActions.setOrderConsent(
//         { i18nKey: "indivisible" },
//         dispatch,
//         "OrderContext.useOrderConsentI18nKey.onlyIndivisible",
//       );
//     }

//     /* -------------------------------------------------------------------------------------------------
//      * Unregistered only
//      * -----------------------------------------------------------------------------------------------*/
//     if (
//       !isAssetRegistered(given?.metadata) ||
//       !isAssetRegistered(taken?.metadata)
//     ) {
//       OrderActions.setOrderConsent(
//         { i18nKey: "unregisteredAsset" },
//         dispatch,
//         "OrderContext.useOrderConsentI18nKey.onlyUnregistered",
//       );
//     }

//     OrderActions.setOrderConsent(
//       { i18nKey: undefined },
//       dispatch,
//       "OrderContext.useOrderConsentI18nKey",
//     );
//   }, [dispatch, given, taken]);
// };

export {};
