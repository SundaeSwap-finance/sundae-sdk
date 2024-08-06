import { AssetAmount, AssetRatio } from "@sundaeswap/asset";
import { TSwapOutcome, getSwapOutput } from "@sundaeswap/cpp";

import { ADA_METADATA } from "../../constants/cardano.constants";
import { IAssetMetaData } from "../../types/Asset.types";
import { TPool } from "../../types/Pool.types";
import { isSameAsset } from "../../utils/assets.utils";
import {
  calculateRouteRatio,
  getApplicableFee,
  getAssetReserve,
  getPoolPairAssetIds,
} from "../../utils/pool.utils";
import {
  EOrderActions,
  EOrderFlowState,
  EOrderType,
  IOrderAction,
  IOrderState,
} from "./types";
import {
  calculateGivenAmountFromTaken,
  calculateTakenAmountFromGiven,
} from "./utils/calculateAssetAmounts";

/**
 * Reducer function for managing state in the application. It takes the current state and an action,
 * and returns a new state depending on the type of the action.
 * @function
 * @param {IOrderState} prevState - The current state before the action is processed.
 * @param {IOrderAction} action - The action to be processed.
 * @returns {IOrderState} The new state after processing the action.
 * @throws Will throw an error if the action type is not handled.
 */
export const reducer = (
  prevState: IOrderState,
  action: IOrderAction,
): IOrderState => {
  let newState: IOrderState;

  switch (action.type) {
    /**
     * In case of setting the given amount, it calculates the corresponding taken amount,
     * and returns a new state with the updated given and taken amounts. This depends on
     * a set limit price, which should always be set if an active pool exists. Otherwise,
     * it will default to only changing the amount provided.
     */
    case EOrderActions.SET_GIVEN_AMOUNT: {
      const newGroupIds = [
        action.payload.given?.metadata?.assetId,
        prevState?.assets?.taken?.metadata?.assetId,
      ].sort();
      const prevPoolIds =
        prevState?.orderRoute &&
        getPoolPairAssetIds(prevState.orderRoute).sort();

      newState = {
        ...prevState,
        assets: {
          given: action.payload.given,
          taken:
            newGroupIds?.toString() === prevPoolIds?.toString()
              ? calculateTakenAmountFromGiven({
                  given: action.payload.given,
                  orderRoute: prevState?.orderRoute,
                  ratio: prevState?.ratio,
                  taken: prevState.assets?.taken,
                  isLimitOrder:
                    prevState?.flowData?.orderType === EOrderType.limit,
                })
              : prevState.assets?.taken?.withAmount(0n),
        },
      };
      break;
    }

    /**
     * In case we are spending a UTXO that is not our wallet,
     * we need an easy way to retrieve this throughout the UI.
     */
    case EOrderActions.SET_GIVEN_UTXO_AMOUNT: {
      newState = {
        ...prevState,
        givenUtxoAmount: action.payload.givenUtxoAmount,
      };
      break;
    }

    /**
     * In case of setting the taken amount, it calculates the corresponding given amount,
     * and returns a new state with the updated taken and given amounts. This depends on
     * a set limit price, which should always be set if an active pool exists. Otherwise,
     * it will default to only changing the amount provided.
     */
    case EOrderActions.SET_TAKEN_AMOUNT: {
      const newGroupIds = [
        action.payload.taken?.metadata?.assetId,
        prevState?.assets?.given?.metadata?.assetId,
      ].sort();
      const prevPoolIds =
        prevState?.orderRoute &&
        getPoolPairAssetIds(prevState.orderRoute).sort();

      newState = {
        ...prevState,
        assets: {
          taken: action.payload.taken,
          given:
            newGroupIds?.toString() === prevPoolIds?.toString()
              ? calculateGivenAmountFromTaken({
                  given: prevState.assets?.given,
                  orderRoute: prevState?.orderRoute,
                  ratio: prevState?.ratio,
                  taken: action.payload.taken,
                  isLimitOrder:
                    prevState?.flowData?.orderType === EOrderType.limit,
                })
              : prevState.assets?.given,
        },
      };
      break;
    }

    /**
     * In case of setting the limit price, it calculates the corresponding taken amount,
     * and returns a new state with the updated limit price and taken amount.
     */
    case EOrderActions.SET_RATIO: {
      const calculatedTakenAmount = calculateTakenAmountFromGiven({
        given: prevState.assets?.given,
        orderRoute: prevState?.orderRoute,
        ratio: action.payload.ratio,
        taken: prevState.assets?.taken,
        isLimitOrder: true,
      });

      newState = {
        ...prevState,
        ratio: action.payload.ratio,
        assets: {
          ...prevState.assets,
          taken: calculatedTakenAmount,
        },
      };
      break;
    }

    case EOrderActions.UNSET_ORDER_ROUTE: {
      newState = {
        ...prevState,
        orderRoute: undefined,
        ratio:
          prevState?.ratio &&
          new AssetRatio(
            prevState.ratio.numerator,
            prevState.ratio.denominator,
          ),
      };
      break;
    }

    case EOrderActions.SET_ORDER_ROUTE: {
      const orderRoute = action.payload.orderRoute as TPool[];

      let assets = prevState.assets;
      if (orderRoute?.length === 1) {
        const pool = orderRoute[0];

        if (!assets?.given && !assets?.taken) {
          assets = {
            given: new AssetAmount<IAssetMetaData>(0n, pool.assetA),
            taken: new AssetAmount<IAssetMetaData>(0n, pool.assetB),
          };
        } else {
          // Ensure new asset metadata is updated if required.
          if (
            assets.given &&
            ![pool.assetA.assetId, pool.assetB.assetId].includes(
              assets.given.metadata.assetId,
            )
          ) {
            assets.given = assets.given.withMetadata(pool.assetA);
          }

          if (
            assets.taken &&
            ![pool.assetA.assetId, pool.assetB.assetId].includes(
              assets.taken.metadata.assetId,
            )
          ) {
            assets.taken = assets.taken.withMetadata(pool.assetB);
          }
        }
      }

      const { given, taken } = assets;

      const calculatedRatio = calculateRouteRatio({
        given: given?.metadata.assetId,
        inputAmount: given?.amount,
        orderRoute,
        taken: taken?.metadata.assetId,
      });

      newState = {
        ...prevState,
        assets,
        orderRoute,
        ratio: calculatedRatio,
      };
      break;
    }

    /**
     * If the user's balance (i.e. wallet balance of the given asset) is less
     * than the given asset's amount, then we update the derived state.
     */
    case EOrderActions.SET_GIVEN_EXCEEDS_BALANCE: {
      newState = {
        ...prevState,
        derived: {
          ...prevState.derived,
          givenExceedsBalance: action.payload.givenExceedsBalance,
        },
      };
      break;
    }

    /**
     * Once the user wants to preview his order, the order is being built upfront.
     * In order to access all the necessary data, we store the data tied to the transaction in the context.
     * Since the `transaction` is an object of type `IOrderStateTransaction`, we set it based on the payload.
     * The payload contains an object of:
     *   - @property {ITxBuilderTx} builtTx : The built transaction containing the `sign` and `complete` methods.
     *   - @property {ITxBuilderComplete} completeTx : The complete transaction containing the cbor, fees and the submit method.
     *   - @property {EOrderTransactionBuilderState} state : The state of the transaction whether it's built, building or if an error took place.
     *   - @property {IOrderTransactionErrorState} error : The error object in case the transaction building threw.
     */
    case EOrderActions.SET_TRANSACTION: {
      newState = {
        ...prevState,
        derived: {
          ...prevState.derived,
          transaction: action.payload.transaction,
        },
      };
      break;
    }

    /**
     * Updates solely the transaction state with the given payload.
     * There are scenarios when we just want to update the transaction state without updating the whole transaction object.
     * For example, when the transaction is being built, we want to update the state to `building` without updating the whole transaction object.
     */
    case EOrderActions.SET_TRANSACTION_STATE: {
      newState = {
        ...prevState,
        derived: {
          ...prevState.derived,
          transaction: {
            ...prevState.derived?.transaction,
            state: action.payload.transactionState,
          },
        },
      };
      break;
    }

    /**
     * Sets the calculated ADA left over after a pending swap transaction.
     */
    case EOrderActions.SET_ADA_AFTER_SWAP: {
      newState = {
        ...prevState,
        derived: {
          ...prevState.derived,
          adaAfterSwap: action.payload.adaAfterSwap,
        },
      };
      break;
    }

    /**
     * Sets the order flow state to display the different views in the order widget.
     */
    case EOrderActions.SET_ORDER_FLOW_STATE: {
      newState = {
        ...prevState,
        flowData: {
          ...prevState.flowData,
          flowState: action.payload.flowState,
        },
      };
      break;
    }
    /**
     * Sets the order flow consent object to render a warning the user has to actively consent.
     */
    case EOrderActions.SET_ORDER_CONSENT: {
      newState = {
        ...prevState,
        flowData: {
          ...prevState.flowData,
          orderConsent: {
            // We are keeping the previous state of the order consent object and only update the given properties.
            // This is necessary since the order consent object contains more properties than just the ones we want to update.
            // Separate reducers would be overhead in this case as we only have two properties to update.
            ...prevState.flowData.orderConsent,
            ...action.payload.orderConsent,
          },
        },
      };
      break;
    }

    /**
     * Resets assets to their default values and sets the flow state to `reset`.
     */
    case EOrderActions.RESET_ORDER_FLOW: {
      newState = {
        ...prevState,
        assets: { given: new AssetAmount(0n, ADA_METADATA), taken: undefined },
        ratio: undefined,
        orderRoute: undefined,
        flowData: {
          ...prevState.flowData,
          flowState: EOrderFlowState.reset,
        },
      };
      break;
    }

    /**
     * Sets the order type to either `limit` or `market`.
     */
    case EOrderActions.SET_ORDER_TYPE: {
      const calculatedTaken = calculateTakenAmountFromGiven({
        given: prevState?.assets?.given,
        orderRoute: prevState?.orderRoute,
        ratio: prevState?.ratio,
        taken: prevState?.assets?.taken,
        isLimitOrder: action.payload.orderType === EOrderType.limit,
      });

      newState = {
        ...prevState,
        assets: {
          ...prevState.assets,
          taken: calculatedTaken || prevState.assets?.taken,
        },
        flowData: {
          ...prevState.flowData,
          orderType: action.payload.orderType,
        },
      };
      break;
    }

    /**
     * Sets the fetching pool boolean. This is usually used
     * when new order information is received and we have to
     * fetch pool data in response.
     */
    case EOrderActions.SET_FETCHING_POOL: {
      newState = {
        ...prevState,
        flowData: {
          ...prevState.flowData,
          fetchingPool: action.payload.fetchingPool,
        },
      };
      break;
    }

    /**
     * Swaps the given and taken assets along with their amounts.
     */
    case EOrderActions.SWAP_ORDER_DIRECTION: {
      const newTaken = prevState.assets?.given
        ? calculateTakenAmountFromGiven({
            given: prevState.assets?.taken,
            isLimitOrder: prevState?.flowData?.orderType === EOrderType.limit,
            taken: prevState.assets?.given,
            orderRoute: prevState?.orderRoute,
            ratio: prevState?.ratio,
          })
        : prevState.assets?.taken;

      newState = {
        ...prevState,
        assets: {
          given: prevState.assets.taken,
          taken: newTaken,
        },
      };
      break;
    }

    /**
     * Sets the contract version to be used for the order.
     */
    case EOrderActions.SET_PROTOCOL_VERSION: {
      newState = {
        ...prevState,
        flowData: {
          ...prevState.flowData,
          contractVersion: action.payload.contractVersion,
        },
      };
      break;
    }

    /**
     * In case the action type is not handled, it throws an error.
     */
    default:
      throw new Error("No action was found!");
  }

  /**
   * We calculate the swap outcome and any possible errors.
   * In particular, we do two things:
   *
   * - Calculate the swap outcome based on the order route and the given asset amount.
   * - Calculate whether or not the pool's taken reserves are nullified by the swap outcome.
   *
   * It's important that we do this here, so that these side-effects are always
   * in-sync with any state changes and happen within the same rerender.
   * The rest of any derived state changes happen in {@link useOrderEffects}.
   */
  let swapOutcome: TSwapOutcome[] | undefined;
  let takenExceedsReserves: boolean = false;

  if (
    newState.orderRoute &&
    newState.assets?.given &&
    newState.assets.given.amount > 0n
  ) {
    if (newState.orderRoute.length === 1) {
      const pool = newState.orderRoute[0];
      if (
        typeof pool.quantityA === "string" &&
        typeof pool.quantityB === "string"
      ) {
        const givenReserve = isSameAsset(
          newState.assets.given.metadata,
          pool.assetA,
        )
          ? BigInt(pool.quantityA)
          : BigInt(pool.quantityB);
        const takenReserve = isSameAsset(
          newState.assets.given.metadata,
          pool.assetA,
        )
          ? BigInt(pool.quantityB)
          : BigInt(pool.quantityA);

        const newSwapOutcome = getSwapOutput(
          newState.assets.given.amount,
          givenReserve,
          takenReserve,
          getApplicableFee({
            pool,
            givenAssetId: newState.assets.given.metadata.assetId,
          }).toNumber(),
        );

        swapOutcome = [newSwapOutcome];
        if (newState.assets?.taken) {
          takenExceedsReserves =
            newSwapOutcome.output > takenReserve ||
            newState.assets.taken.amount > takenReserve;
        }
      }
    } else {
      const firstPool = newState.orderRoute[0];
      const { firstInputAsset, firstOutputAsset } =
        newState.assets.given.metadata.assetId === firstPool.assetA.assetId
          ? {
              firstInputAsset: firstPool.assetA,
              firstOutputAsset: firstPool.assetB,
            }
          : {
              firstInputAsset: firstPool.assetB,
              firstOutputAsset: firstPool.assetA,
            };

      const firstInputReserve = getAssetReserve(
        new AssetAmount(1, firstInputAsset),
        firstPool,
      );
      const firstOutputReserve = getAssetReserve(
        new AssetAmount(1, firstOutputAsset),
        firstPool,
      );

      const firstSwapOutcome = getSwapOutput(
        newState.assets.given.amount,
        firstInputReserve,
        firstOutputReserve,
        getApplicableFee({
          pool: firstPool,
          givenAssetId: firstInputAsset.assetId,
        }).toNumber(),
      );

      const secondPool = newState.orderRoute[1];
      const { secondInputAsset, secondOutputAsset } =
        newState.assets.taken?.metadata.assetId === secondPool.assetA.assetId
          ? {
              secondOutputAsset: secondPool.assetA,
              secondInputAsset: secondPool.assetB,
            }
          : {
              secondOutputAsset: secondPool.assetB,
              secondInputAsset: secondPool.assetA,
            };

      const secondInputReserve = getAssetReserve(
        new AssetAmount(1, secondInputAsset),
        secondPool,
      );
      const secondOutputReserve = getAssetReserve(
        new AssetAmount(1, secondOutputAsset),
        secondPool,
      );
      const secondSwapOutcome = getSwapOutput(
        firstSwapOutcome.output,
        secondInputReserve,
        secondOutputReserve,
        getApplicableFee({
          pool: secondPool,
          givenAssetId: secondInputAsset.assetId,
        }).toNumber(),
      );

      swapOutcome = [firstSwapOutcome, secondSwapOutcome];
      if (newState.assets?.taken) {
        takenExceedsReserves =
          firstSwapOutcome.output > firstOutputReserve ||
          secondSwapOutcome.output > secondOutputReserve ||
          newState.assets.taken.amount > secondOutputReserve;
      }
    }
  }

  newState = {
    ...newState,
    derived: {
      ...newState.derived,
      swapOutcome,
      takenExceedsReserves,
    },
  };

  /**
   * @NOTE
   * This is for debugging purposes and traces
   * dispatch updates to their point of origin.
   * **NEVER** allow this on production.
   */
  if (window.location.href.includes("debugOrderContext")) {
    // eslint-disable-next-line no-console
    console.log(action.key ? `${action.key}: ` : "Unknown Key: ", {
      action: action.type,
      payload: action.payload,
      newState,
    });
  }

  return newState;
};
