import { IAsset, IAssetParsedID } from "../types";
import { ERROR_CODES } from "./errors.js";

export const toLovelace = (val: BigInt, decimals: number) =>
  Math.floor(Number(val) * Math.pow(10, decimals));
export const fromLovelace = (val: BigInt, decimals: number) =>
  Math.floor(Number(val) / Math.pow(10, decimals));
export const getAssetIDs = (asset: IAsset): IAssetParsedID => {
  const {
    metadata: { assetID },
  } = asset;

  if (56 !== assetID.indexOf(".")) {
    console.error(ERROR_CODES[2]);
    throw new Error(ERROR_CODES[2].message);
  }

  const policy = assetID.slice(0, 56);
  const name = assetID.slice(58);

  return {
    name,
    policy,
    concatenated: `${policy}${name}`,
  };
};
