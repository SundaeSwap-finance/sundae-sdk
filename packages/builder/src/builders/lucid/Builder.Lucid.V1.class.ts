import { AssetAmount } from "@sundaeswap/asset";
import { SundaeUtils } from "@sundaeswap/core/utilities";
import { Data } from "lucid-cardano";

import { Builder, ITask } from "../../abstracts/Builder.abstract.class";
import { ESwapType, SwapConfig } from "../../configs/SwapConfig";
import { SerializationLucidV3 } from "../../serialization/lucid/Serialization.Lucid.V3.class";
import { Swap, TSwap } from "../../serialization/lucid/contracts/contracts.v3";

export class BuilderLucidV1 extends Builder {
  tasks: ITask[] = [];
  serializationLibrary: SerializationLucidV3;
  txSigned?: string | undefined;
  txUnsigned?: string | undefined;

  constructor() {
    super();
    this.serializationLibrary = new SerializationLucidV3();
  }

  swap(
    config: SwapConfig | ((prevDatum: TSwap) => SwapConfig),
  ): BuilderLucidV1 {
    const resolvedConfig =
      typeof config === "function"
        ? config(
            Data.from(this.tasks[this.tasks.length - 1].datum.cbor, Swap),
          ).getArgs()
        : config.getArgs();

    let minReceivableAsset: AssetAmount;
    switch (resolvedConfig.swapType.type) {
      case ESwapType.MARKET:
        minReceivableAsset = SundaeUtils.getMinReceivableFromSlippage(
          resolvedConfig.pool,
          resolvedConfig.suppliedAsset,
          resolvedConfig.swapType.slippage,
        );
        break;
      case ESwapType.LIMIT:
        minReceivableAsset = resolvedConfig.swapType.minReceivable;
        break;
      default:
        throw new Error("Invalid swap type.");
    }

    const swapDatum: TSwap = {
      minReceived: [
        ...this.__getAssetIdForDatum(minReceivableAsset),
        minReceivableAsset.amount,
      ],
      offer: [
        ...this.__getAssetIdForDatum(resolvedConfig.suppliedAsset),
        resolvedConfig.suppliedAsset.amount,
      ],
    };

    const datum = this.serializationLibrary.encodeSwapDatum(swapDatum);

    this.tasks.push({
      _id: "",
      datum,
      payment: {
        [resolvedConfig.suppliedAsset.metadata.assetId.replace(".", "")]:
          resolvedConfig.suppliedAsset.amount,
      },
    });

    return this;
  }

  private __getAssetIdForDatum = (asset: AssetAmount): [string, string] => {
    const result: [string, string] = ["", ""];
    const [policyId, assetName] = asset.metadata.assetId.split(".");
    if (policyId.length === 56) {
      result[0] = policyId;
    }

    if (!SundaeUtils.isAdaAsset(asset.metadata)) {
      result[1] = assetName;
    }

    return result;
  };
}
