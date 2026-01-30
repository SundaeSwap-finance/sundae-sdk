import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  EDestinationType,
  IPoolData,
  IStrategyConfigArgs,
  IStrategyConfigInputArgs,
  TDestination,
  TDestinationFixed,
} from "../@types";
import { Config } from "../Abstracts/Config.abstract.class.js";

export class StrategyConfig extends Config<IStrategyConfigArgs> {
  /**
   * The data for the pool involved in the order.
   */
  pool?: IPoolData;

  /**
   * The destination for the order.
   */
  destination?: TDestination;

  ownerAddress?: string;
  suppliedAsset?: AssetAmount<IAssetAmountMetadata>;
  authSigner?: string;
  authScript?: string;
  /**
   * The number of executions planned for this strategy.
   * Used to calculate the total scooper fees required.
   * Defaults to 1n if not provided.
   */
  executionCount?: bigint;

  constructor(args?: IStrategyConfigInputArgs) {
    super();

    args && this.setFromObject(args);
  }

  setDestination(destination: TDestination) {
    this.destination = destination;
    return this;
  }

  setPool(pool: IPoolData) {
    this.pool = pool;
    return this;
  }

  setSuppliedAsset(asset: AssetAmount<IAssetAmountMetadata>) {
    this.suppliedAsset = asset;
    return this;
  }

  setOwnerAddress(ownerAddress: string) {
    this.ownerAddress = ownerAddress;
    return this;
  }

  setAuthSigner(signer: string) {
    this.authSigner = signer;
    return this;
  }

  setAuthScript(script: string) {
    this.authScript = script;
    return this;
  }

  setExecutionCount(count: bigint) {
    this.executionCount = count;
    return this;
  }

  buildArgs(): IStrategyConfigArgs {
    this.validate();

    return {
      pool: this.pool!,
      destination: this.destination!,
      ownerAddress:
        this.ownerAddress || (this.destination as TDestinationFixed).address,
      referralFee: this.referralFee,
      suppliedAsset: this.suppliedAsset!,
      authSigner: this.authSigner,
      authScript: this.authScript,
      executionCount: this.executionCount,
    };
  }

  setFromObject({
    destination,
    pool,
    ownerAddress,
    suppliedAsset,
    authSigner,
    authScript,
    executionCount,
  }: IStrategyConfigInputArgs): void {
    this.setDestination(destination);
    this.setPool(pool);
    this.setSuppliedAsset(suppliedAsset);
    ownerAddress && this.setOwnerAddress(ownerAddress);
    authSigner && this.setAuthSigner(authSigner);
    authScript && this.setAuthScript(authScript);
    executionCount && this.setExecutionCount(executionCount);
  }

  validate(): void {
    super.validate();

    if (!this.pool) {
      throw new Error(
        "You haven't set a pool in your Config. Set a pool with .setPool()",
      );
    }

    if (!this.destination) {
      throw new Error(
        "You haven't defined the Destination in your Config. Set with .setDestination()",
      );
    }

    if (!this.suppliedAsset) {
      throw new Error(
        "You haven't funded this strategy! Fund in with .setSuppliedAsset()",
      );
    }

    if (!this.ownerAddress && this.destination.type === EDestinationType.SELF) {
      throw new Error(
        "If your destination is self, you must provide your owner address. Pass it with .setOwnerAddress()",
      );
    }

    if (!this.authSigner && !this.authScript) {
      throw new Error(
        "You need to authorize someone to execute the strategy, by calling .setAuthSigner() or .setAuthScript()",
      );
    }
    if (this.authSigner && this.authScript) {
      throw new Error(
        "You may authorize with either a signer or a script, but not both.",
      );
    }
  }
}
