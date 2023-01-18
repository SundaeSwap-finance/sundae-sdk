/**
 * This class takes care of resolving asset amounts based on their diminutive amounts vs their decimal amounts.
 * Each asset is registered with a decimal place for it's token.
 *
 *
 * @example
 * To create a class for 10 ADA, you would enter the lovelace amount `10000000`
 * as well as the decimal place that is registered, which is `6`.
 *
 * ```ts
 * const myAsset = new AssetAmount(2000000n, 6);
 *
 * myAsset.getAmount() // 2
 * myAsset.getRawAmount() // 2000000
 * myAsset.getDecimals() // 6
 * ```
 */
export class AssetAmount {
  public amount: bigint;
  public decimals: number;

  /**
   * Construct a new AssetAmount.
   *
   * @param amount Diminutive amount of the asset, without decimals.
   * @param decimals The registered decimals of the asset token.
   */
  constructor(amount: bigint, decimals?: number) {
    this.amount = amount;
    this.decimals = decimals ?? 0;
  }

  getRawAmount(decimals?: number): bigint {
    return BigInt(
      Math.floor(Number(this.amount) * Math.pow(10, decimals ?? this.decimals))
    );
  }

  getNumber() {
    return Number(this.amount.toString());
  }

  getAmount() {
    return this.amount;
  }

  getDecimals() {
    return this.decimals;
  }
}
