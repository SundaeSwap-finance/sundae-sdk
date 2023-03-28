// @ts-ignore
import * as cbor from "cbor-web";

import {
  PoolCoin,
  IAsset,
  IPoolData,
  IPoolDataAsset,
  IProtocolParams,
  TSupportedNetworks,
} from "../@types";
import { ADA_ASSET_ID } from "../lib/constants";
import { AssetAmount } from "./AssetAmount.class";

export class Utils {
  static getParams(network: TSupportedNetworks): IProtocolParams {
    const params: Record<TSupportedNetworks, IProtocolParams> = {
      mainnet: {
        ESCROW_ADDRESS: "",
        SCOOPER_FEE: 2500000n,
        RIDER_FEE: 2000000n,
        ESCROW_CANCEL_REDEEMER: "",
        ESCROW_SCRIPT_VALIDATOR: "",
      },
      preview: {
        ESCROW_ADDRESS:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        SCOOPER_FEE: 2500000n,
        RIDER_FEE: 2000000n,
        ESCROW_CANCEL_REDEEMER: "d87a80",
        ESCROW_SCRIPT_VALIDATOR:
          "5906f501000033233223232323232323322323233223232323222323232322322323232325335001101d13263201d335738921035054350001d32325335001133530121200123353013120012333573466e3cdd700080100b00a9aa8021111111111001991a800911a80111199aa980b0900091299a8011099a8138008010800a81299a8121a8011119a80111a8100009280f99a812001a8129a8011111001899a9809090009191919199ab9a3370e646464646002008640026aa0504466a0029000111a80111299a999ab9a3371e0040360420402600e0022600c006640026aa04e4466a0029000111a80111299a999ab9a3371e00400e04003e20022600c00666e292201027020003500722220043335501975c66aa032eb9d69a9999ab9a3370e6aae75400d200023332221233300100400300235742a0066ae854008cd406dd71aba135744a004464c6404666ae7008008c0848880092002018017135744a00226aae7940044dd50009aa80191111111110049999ab9a3370ea00c9001109100111999ab9a3370ea00e9000109100091931900f99ab9c01c01f01d01c3333573466e1cd55cea8052400046666444424666600200a0080060046eb8d5d0a8051919191999ab9a3370e6aae754009200023232123300100300233501a75c6ae84d5d128019919191999ab9a3370e6aae754009200023232123300100300233501e75c6ae84d5d128019919191999ab9a3370e6aae7540092000233221233001003002302435742a00466a0424646464646666ae68cdc3a800a4004466644424466600200a0080066eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002321223002003302b357426aae7940188c98c80c0cd5ce01681801701689aab9d5003135744a00226aae7940044dd50009aba135744a004464c6405266ae700980a409c4d55cf280089baa00135742a004464c6404a66ae7008809408c4d55cf280089baa00135742a004464c6404266ae7007808407c4d55cf280089baa00135742a0126eb4d5d0a80419191919191999ab9a3370ea002900211909111801802191919191999ab9a3370ea002900111909118010019919191999ab9a3370e6aae7540092000232321233001003002375a6ae84d5d128019bad35742a004464c6405866ae700a40b00a84d55cf280089baa001357426aae7940108cccd5cd19b875002480008cc88488cc00401000cc094d5d0a8021bad357426ae8940108c98c80a4cd5ce01301481381309aab9d5002135573ca00226ea8004d5d09aab9e500523333573466e1d4009200223212223001004375a6ae84d55cf280311999ab9a3370ea00690001199911091119980100300280218109aba15006375a6ae854014cd4075d69aba135744a00a464c6404a66ae7008809408c0880844d55cea80189aba25001135573ca00226ea8004d5d09aba2500823263201d33573803403a036264a66a601c6aae78dd50008980d24c442a66a0022603893110a99a8008980f24c442a66a0022604093110a99a8008981124c442a66a0022604893110a99a8008981324c442a66a0022605093110a99a8008981524c442a66a0022605893110a99a800899999991111109199999999980080380300b80a802802007801801004981080a18108091810806181080518108031810802110981824c6a6666ae68cdc39aab9d5002480008cc8848cc00400c008d5d0a8011aba135744a004464c6403866ae70064070068880084d55cf280089baa001135573a6ea80044d5d1280089aba25001135573ca00226ea80048c008dd6000990009aa808911999aab9f0012501323350123574200460066ae8800803cc8004d5404088448894cd40044008884cc014008ccd54c01c48004014010004c8004d5403c884894cd400440148854cd4c01000840204cd4c018480040100044880084880044488c88c008dd5800990009aa80711191999aab9f00225011233501033221233001003002300635573aa004600a6aae794008c010d5d100180709aba100112232323333573466e1d400520002350073005357426aae79400c8cccd5cd19b875002480089401c8c98c8038cd5ce00580700600589aab9d5001137540022424460040062244002464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931900519ab9c00700a008007135573aa00226ea80048c8cccd5cd19b8750014800884880048cccd5cd19b8750024800084880088c98c8020cd5ce00280400300289aab9d375400292103505431002326320033357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e00003498480044488008488488cc00401000c448c8c00400488cc00cc00800800522011c4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c90001",
      },
    };

    return params[network];
  }

  static sortSwapAssets(
    assets: [IPoolDataAsset | IAsset, IPoolDataAsset | IAsset]
  ) {
    return assets.sort((a, b) => a.assetId.localeCompare(b.assetId));
  }

  static getAssetSwapDirection(
    { assetId: assetID }: IAsset,
    assets: [IPoolDataAsset, IPoolDataAsset]
  ): PoolCoin {
    const sorted = Utils.sortSwapAssets(assets);
    if (Object.values(sorted[1]).includes(assetID)) {
      return 1;
    }

    return 0;
  }

  static convertPoolFeeToPercent(fee: string): number {
    return Number(fee) / 100;
  }

  static subtractPoolFeeFromAmount(amount: AssetAmount, fee: string): number {
    const feePercent = Utils.convertPoolFeeToPercent(fee);
    return Number(amount.getAmount()) * (1 - feePercent);
  }

  static getMinReceivableFromSlippage(
    pool: IPoolData,
    suppliedAsset: IAsset,
    slippage: number
  ): AssetAmount {
    const base = Utils.subtractPoolFeeFromAmount(
      suppliedAsset.amount,
      pool.fee
    );

    let ratio: number;
    let decimals: number;

    if (suppliedAsset.assetId === pool.assetA.assetId) {
      decimals = pool.assetB.decimals;
      ratio = Number(pool.quantityB) / Number(pool.quantityA);
    } else if (suppliedAsset.assetId === pool.assetB.assetId) {
      decimals = pool.assetA.decimals;
      ratio = Number(pool.quantityA) / Number(pool.quantityB);
    } else {
      throw new Error(
        `The supplied asset ID does not match either assets within the supplied pool data. ${JSON.stringify(
          {
            suppliedAssetID: suppliedAsset.assetId,
            poolAssetIDs: [pool.assetA.assetId, pool.assetB.assetId],
          }
        )}`
      );
    }

    const amount = BigInt(Math.floor(base * ratio * (1 - slippage)));
    return new AssetAmount(amount, decimals);
  }

  /**
   * Takes an array of {@link IAsset} and aggregates them into an object of amounts.
   * This is useful for when you are supplying an asset that is both for the payment and
   * the Order.
   *
   * @param suppliedAssets
   */
  static accumulateSuppliedAssets(
    suppliedAssets: IAsset[],
    network: TSupportedNetworks,
    additionalADA?: bigint
  ): Record<
    /** The PolicyID and the AssetName concatenated together with no period. */
    string | "lovelace",
    /** The amount as a bigint (no decimals) */
    bigint
  > {
    const assets: Record<string, bigint> = {};
    const { SCOOPER_FEE, RIDER_FEE } = Utils.getParams(network);

    const aggregatedAssets = suppliedAssets.reduce((acc, curr) => {
      const existingAsset = acc.find(
        ({ assetId: assetID }) => curr.assetId === assetID
      );
      if (existingAsset) {
        existingAsset.amount.add(curr.amount.getAmount());
        return acc;
      }

      return [...acc, curr];
    }, [] as IAsset[]);

    // Set the minimum ADA amount.
    assets.lovelace = SCOOPER_FEE + RIDER_FEE + (additionalADA ?? 0n);

    aggregatedAssets.forEach((suppliedAsset) => {
      if (suppliedAsset.assetId === ADA_ASSET_ID) {
        assets.lovelace += suppliedAsset.amount.getAmount();
      } else {
        assets[suppliedAsset.assetId.replace(".", "")] =
          suppliedAsset.amount.getAmount();
      }
    });

    return assets;
  }

  /**
   * Split a long string into an array of chunks for metadata.
   *
   * @param str Full string that you wish to split by chunks of 64.
   * @param prefix Optional prefix to add to each chunk. This is useful if your transaction builder has helper functions to convert strings to CBOR bytestrings (i.e. Lucid will convert strings with a `0x` prefix).
   */
  static splitMetadataString(str: string, prefix?: string): string[] {
    const result: string[] = [];
    const chunk = prefix ? 64 - prefix.length : 64;
    for (let i = 0; i < str.length; i += chunk) {
      const slicedStr = str.slice(i, i + chunk);
      result.push(`${prefix ?? ""}${slicedStr}`);
    }
    return result;
  }
}
