import { AssetAmount } from "@sundaeswap/asset";

import { EDatumType, TDestinationAddress } from "../../@types/index.js";
import { PREVIEW_DATA } from "../../TestUtilities/mockData.js";
import { ADA_METADATA } from "../../constants.js";
import {
  IDatumBuilderDepositV3Args,
  IDatumBuilderMintPoolV3Args,
  IDatumBuilderPoolMintRedeemerV3Args,
  IDatumBuilderSwapV3Args,
  IDatumBuilderWithdrawV3Args,
} from "../DatumBuilder.V3.class.js";

const DEFAULT_DESTINATION_ADDRESS = PREVIEW_DATA.addresses.alternatives[2];

const defaultMintPoolArgs: IDatumBuilderMintPoolV3Args = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fees: {
    bid: 5n,
    ask: 5n,
  },
  marketOpen: 123n,
  depositFee: 2_000_000n,
  seedUtxo: {
    txHash: "598d48e74d2aec716c1c8c889b34d77b9e0f5240dbee805c23267c2f1f97cc11",
    outputIndex: 1,
  },
};

export const V3_EXPECTATIONS = {
  buildAssetAmountDatum: [
    {
      args: new AssetAmount(100n, ADA_METADATA),
      expectations: {
        inline: "9f40401864ff",
        hash: "cb90c63e643bc988196901fccdd4c70eebe5bfc14cd174e5016e6bd3c5265ffb",
      },
    },
    {
      args: new AssetAmount(100_000_000n, {
        ...ADA_METADATA,
        assetId:
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.44554d4d59",
      }),
      expectations: {
        inline:
          "9f581cd441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf4544554d4d591a05f5e100ff",
        hash: "4cbe3fd96ab17c6b2d492952ffea39d3d45c29525f28dd2c9f40f408840bea6b",
      },
    },
  ],
  buildDepositDatum: [
    {
      args: {
        destinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
        ident: PREVIEW_DATA.pools.v3.ident,
        order: {
          assetA: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
          assetB: new AssetAmount(100n, {
            ...ADA_METADATA,
            assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
          }),
        },
        scooperFee: 1_000_000n,
      } as IDatumBuilderDepositV3Args,
      expectations: {
        inline:
          "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87b9f9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffffff43d87980ff",
        hash: "9ec6ee3514c6e53c2f60482cb582e518e255311dca928a9efeb0f003794c47b9",
      },
    },
  ],
  buildDestinationAddresses: [
    {
      args: {
        datum: {
          type: EDatumType.NONE,
        },
        address: DEFAULT_DESTINATION_ADDRESS,
      } as TDestinationAddress,
      expectations: {
        inline:
          "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87980ff",
        hash: "a37a97d7c424ff00ff2c6413f9cc429e098623a73c440e8210cdb573a45fad5e",
      },
    },
    {
      args: {
        datum: {
          type: EDatumType.NONE,
        },
        address:
          "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
      } as TDestinationAddress,
      expectations: {
        inline:
          "d8799fd8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ffd87a80ffd87980ff",
        hash: "d7ee2cd795539dce9bac9ace4c692628f68e64869c7da1ed3cd3e66e4bbfeb48",
      },
    },
    {
      args: {
        address: DEFAULT_DESTINATION_ADDRESS,
        datum: {
          type: EDatumType.HASH,
          value:
            "a37a97d7c424ff00ff2c6413f9cc429e098623a73c440e8210cdb573a45fad5e",
        },
      } as TDestinationAddress,
      expectations: {
        inline:
          "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a9f5820a37a97d7c424ff00ff2c6413f9cc429e098623a73c440e8210cdb573a45fad5effff",
        hash: "a8aba08d22205ee59aa9d9e3def1405eb0c51b81639f856fb04e2aef64b8f43e",
      },
    },
    {
      args: {
        address: DEFAULT_DESTINATION_ADDRESS,
        datum: {
          type: EDatumType.INLINE,
          value:
            "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
        },
      } as TDestinationAddress,
      expectations: {
        inline:
          "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87b9fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ffffff",
        hash: "d9adacb380f33fb58ff942e2a8d3098585a9599e702a650fc039a69f451132f2",
      },
    },
    {
      args: {
        address:
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe",
        datum: {
          type: EDatumType.INLINE,
          value:
            "d8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87b9fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ffffff",
        },
      } as TDestinationAddress,
      expectations: {
        inline:
          "d8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd87b9fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87b9fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ffffffffff",
        hash: "7450c48285dee233264bf53a0aa0fcebae0001fd71c052fc2c57bbabd3851b48",
      },
    },
    {
      // @ts-expect-error Invalid type.
      args: {
        datum: {
          type: "notvalid",
        },
        address: DEFAULT_DESTINATION_ADDRESS,
      } as TDestinationAddress,
      expectations: {
        error:
          "Could not find a matching datum type for the destination address. Aborting.",
      },
    },
    {
      args: {
        address:
          "stake_test1uqxn89tuq7kdmhkvnzpy2ldz9uz7p5vf7l7ftvvh9ek4zpghgvr36",
        datum: {
          type: EDatumType.NONE,
        },
      } as TDestinationAddress,
      expectations: {
        error:
          "Could not find a payment key in the address: stake_test1uqxn89tuq7kdmhkvnzpy2ldz9uz7p5vf7l7ftvvh9ek4zpghgvr36",
      },
    },
    {
      args: {
        address: "invalid",
        datum: {
          type: EDatumType.NONE,
        },
      } as TDestinationAddress,
      expectations: {
        error: {
          lucid:
            "You supplied an invalid address: invalid. Please check your arguments and try again. Error message: No address type matched for: invalid",
          blaze:
            "You supplied an invalid address: invalid. Please check your arguments and try again. Error message: invalid string length: 7 (invalid). Expected (8..1023)",
        },
      },
    },
    {
      args: {
        address: DEFAULT_DESTINATION_ADDRESS,
        datum: {
          type: EDatumType.NONE,
        },
      } as TDestinationAddress,
      expectations: {
        error: {
          lucid:
            "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294.",
          blaze:
            "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294.",
        },
      },
    },
    {
      args: {
        // Taken randomly from Cardanoscan
        address:
          "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
        datum: {
          type: EDatumType.NONE,
        },
      } as TDestinationAddress,
      expectations: {
        error: {
          lucid:
            "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk.",
          blaze:
            "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk.",
        },
      },
    },
    {
      args: {
        address:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        datum: {
          type: EDatumType.NONE,
        },
      } as TDestinationAddress,
      expectations: {
        calledWith:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        error:
          "The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed.",
      },
    },
    {
      args: {
        address:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        datum: {
          type: EDatumType.HASH,
          value: "invalidDatum",
        },
      } as TDestinationAddress,
      expectations: {
        calledWith:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        error: {
          lucid:
            'The datum provided was not a valid hex string. Original error: {"datum":{"type":"HASH","value":"invalidDatum"}}',
          blaze:
            'The datum provided was not a valid hex string. Original error: {"datum":{"type":"HASH","value":"invalidDatum"},"originalErrorMessage":"Invalid string: \\"expected hex string\\""}',
        },
      },
    },
  ],
  buildMintPoolDatum: [
    {
      args: defaultMintPoolArgs,
      expectations: {
        calledWith: [1, defaultMintPoolArgs.seedUtxo],
        returnedWith: [
          1,
          "82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c92",
        ],
        buildLexicographicalAssetsDatumCalls: 1,
        inline:
          "d8799f581c82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c929f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80187b1a001e8480ff",
        hash: "74ad7bb184438e4b4b2beab38db9d1499620261192d6519abeff3d96dd5688fd",
      },
    },
    {
      args: {
        ...defaultMintPoolArgs,
        fees: {
          ask: 87n,
          bid: 100n,
        },
        seedUtxo: {
          outputIndex: 4,
          txHash: defaultMintPoolArgs.seedUtxo.txHash,
        },
      } as IDatumBuilderMintPoolV3Args,
      expectations: {
        calledWith: [1, defaultMintPoolArgs.seedUtxo],
        returnedWith: [
          1,
          "bc8ab244680421cb8b35f58077fc256b6975b7e84c9a7635e616b4b8",
        ],
        buildLexicographicalAssetsDatumCalls: 1,
        inline:
          "d8799f581cbc8ab244680421cb8b35f58077fc256b6975b7e84c9a7635e616b4b89f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d0018641857d87a80187b1a001e8480ff",
        hash: "c18a0592e5d706f2c8bf6cd38bf5762e0a01455e32a096f3430317abc3af6926",
      },
    },
  ],
  buildOwnerDatum: [
    {
      args: PREVIEW_DATA.addresses.current,
      expectations: {
        calledWith: PREVIEW_DATA.addresses.current,
        inline:
          "d8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff",
        hash: "eacbeb744f70afc638bd8e610fc8c91d5761da59ace673aeb3cb23a3f9fb5eab",
        schemaMatch: {
          Address: {
            hex: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
          },
        },
      },
    },
  ],
  validatePoolIdent: [
    {
      args: PREVIEW_DATA.pools.v1.ident,
      expectations: {
        error:
          "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.",
      },
    },
    {
      args: PREVIEW_DATA.pools.v3.ident,
      expectations: {
        result: PREVIEW_DATA.pools.v3.ident,
      },
    },
  ],
  buildPoolMintRedeemerDatum: [
    {
      args: {
        assetA: PREVIEW_DATA.assets.tada,
        assetB: PREVIEW_DATA.assets.tindy,
        metadataOutput: 2n,
        poolOutput: 0n,
      } as IDatumBuilderPoolMintRedeemerV3Args,
      expectations: {
        inline:
          "d87a9f9f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0002ff",
        hash: "9bc5da88d102726e0d3f6f17ae9528b03d7dde2d4a436699e7b6c7cf678558ea",
        called: 1,
      },
    },
  ],
  buildSwapDatum: [
    {
      args: {
        destinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
        ident: PREVIEW_DATA.pools.v3.ident,
        order: {
          offered: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
          minReceived: new AssetAmount(100n, {
            ...ADA_METADATA,
            assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
          }),
        },
        scooperFee: 1_000_000n,
      } as IDatumBuilderSwapV3Args,
      expectations: {
        inline:
          "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffff43d87980ff",
        hash: "7ab5f75f28ed8ab84bb11e66c9784cf5d9f5cd5d85de3a62eb9c417003dcd2b5",
      },
    },
    {
      args: {
        destinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.HASH,
            value:
              "801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7da",
          },
        },
        ident: PREVIEW_DATA.pools.v3.ident,
        order: {
          offered: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
          minReceived: new AssetAmount(100n, {
            ...ADA_METADATA,
            assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
          }),
        },
        scooperFee: 1_000_000n,
      } as IDatumBuilderSwapV3Args,
      expectations: {
        inline:
          "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a9f5820801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7daffffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffff43d87980ff",
        hash: "523b3e827f589a615cf42a15d355283c8156693940d68b687dfc2d48c98702d9",
      },
    },
  ],
  buildWithdrawDatum: [
    {
      args: {
        destinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
        ident: PREVIEW_DATA.pools.v3.ident,
        order: {
          lpToken: new AssetAmount(100n, PREVIEW_DATA.assets.tada.metadata),
        },
        scooperFee: 1_000_000n,
      } as IDatumBuilderWithdrawV3Args,
      expectations: {
        inline:
          "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87c9f9f40401864ffff43d87980ff",
        hash: "911b23d316c20c696d81b7f08a9d226a4d0cdb2532726c94fba1a58934b634b9",
      },
    },
  ],
  computePoolId: [
    {
      args: defaultMintPoolArgs.seedUtxo,
      expectations: {
        result: "82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c92",
      },
    },
  ],
  getDestinationFromDatum: [
    {
      args: "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a9f5820801781d78d0a71944986666b6edd375c7ac039002a0ecbf55258c69bd6dcd7daffffd87a9f9f40401864ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591864ffff43d87980ff",
      expectations: {
        result: {
          paymentKeyHash:
            "c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a",
          stakingKeyHash:
            "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
        },
      },
    },
  ],
  getSignerKeyFromDatum: [
    {
      args: "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401a017d7840ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a00465cbbffff43d87980ff",
      expectations: {
        result: "121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
      },
    },
  ],
};
