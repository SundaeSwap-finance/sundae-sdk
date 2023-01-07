import { IAssetAmountClass } from "../../types";

export class AssetAmount implements IAssetAmountClass {
  public amount: bigint;
  public decimals: number;

  constructor(amount: bigint, decimals?: number) {
    this.amount = amount;
    this.decimals = decimals ?? 0;
  }

  getRawAmount(decimals?: number): bigint {
    return BigInt(
      Math.floor(Number(this.amount) * Math.pow(10, decimals ?? this.decimals))
    );
  }

  getAmount() {
    return this.amount;
  }

  getDecimals() {
    return this.decimals;
  }
}
