/**
 * This class takes care of resolving asset amounts based on their diminutive amounts vs their decimal amounts.
 * Each asset is registered with a decimal place for it's token.
 *
 *
 * @example
 * To create a class for 2.005 ADA, you would enter the lovelace amount as a `BigInt`,
 * as well as the decimal place as a number, which is `6`.
 *
 * ```ts
 * const myAsset = new AssetAmount(2005000n, 6);
 *
 * myAsset.getAmount() // 2005000n
 * myAsset.getDecimals() // 6
 * myAsset.getDenominatedAmount() // 2.005000
 * ```
 */
export class AssetAmount {
  private amount: bigint;
  private decimals: number;

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

  /**
   * Converts a BigInt to a float based on the provided decimal place.
   * @returns
   */
  getDenominatedAmount(): number {
    const factor = 10 ** this.decimals;
    return Number(this.amount) / factor;
  }

  /**
   * Returns the provided diminutive amount of the asset, without a decimal place.
   * @returns
   */
  getAmount() {
    return this.amount;
  }

  /**
   * Returns the provided decimal place of the asset amount.
   * @returns
   */
  getDecimals() {
    return this.decimals;
  }

  /**
   * Helper method to increment the asset amount.
   * @returns
   */
  add(amt: bigint) {
    this.amount += amt;
  }

  /**
   * Helper method to subtract the asset amount.
   * @returns
   */
  subtract(amt: bigint) {
    this.amount -= amt;
  }
}
