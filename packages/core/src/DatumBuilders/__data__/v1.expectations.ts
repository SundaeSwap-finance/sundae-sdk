import { AssetAmount } from "@sundaeswap/asset";

import {
  EDatumType,
  EPoolCoin,
  IDepositArguments,
  ISwapArguments,
  TOrderAddressesArgs,
} from "../../@types/index.js";
import { PREVIEW_DATA } from "../../TestUtilities/mockData.js";
import { ADA_METADATA } from "../../constants.js";

export const V1_EXPECTATIONS = {
  datums: {
    buildDepositDatum: [
      {
        args: {
          orderAddresses: {
            DestinationAddress: {
              address: PREVIEW_DATA.addresses.current,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          ident: PREVIEW_DATA.pools.v1.ident,
          deposit: {
            CoinAAmount: new AssetAmount(
              100n,
              PREVIEW_DATA.assets.tada.metadata
            ),
            CoinBAmount: new AssetAmount(100n, {
              ...ADA_METADATA,
              assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
            }),
          },
          scooperFee: 1_000_000n,
        } as IDepositArguments,
        expectations: {
          inline:
            "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a000f4240d87b9fd87a9fd8799f18641864ffffffff",
          hash: "0a6041738e5b943c28c628ae16bcde5e9f0bdda8607a1b12413a80435fc99d7f",
        },
      },
    ],
    buildOrderAddresses: [
      {
        args: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.alternatives[2],
            datum: {
              type: EDatumType.NONE,
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          inline:
            "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff",
          hash: "837c3df94f875534d8d3ff3a4b371df815df004acd2e11ddd509ec26f8c26625",
        },
      },
      {
        args: {
          DestinationAddress: {
            datum: {
              type: EDatumType.NONE,
            },
            address:
              "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
          },
        } as TOrderAddressesArgs,
        expectations: {
          inline:
            "d8799fd8799fd8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ffd87a80ffd87a80ffd87a80ff",
          hash: "816c3957ca91b1a49401d32f625808c2bb1aa8a3049facf26ff2a84dfa51126a",
        },
      },
      {
        args: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.alternatives[2],
            datum: {
              type: EDatumType.HASH,
              value:
                "837c3df94f875534d8d3ff3a4b371df815df004acd2e11ddd509ec26f8c26625",
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          inline:
            "d8799fd8799fd8799fd8799f581cff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf8ffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd8799f5820837c3df94f875534d8d3ff3a4b371df815df004acd2e11ddd509ec26f8c26625ffffd87a80ff",
          hash: "b529a0aaa399367d664c5aaca86f24f9c5da39734806e912daec2f56a55c7e86",
        },
      },
      {
        args: {
          DestinationAddress: {
            address:
              "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe",
            datum: {
              type: EDatumType.HASH,
              value:
                "b529a0aaa399367d664c5aaca86f24f9c5da39734806e912daec2f56a55c7e86",
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          inline:
            "d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f5820b529a0aaa399367d664c5aaca86f24f9c5da39734806e912daec2f56a55c7e86ffffd87a80ff",
          hash: "8cfb4238ba10fb94f864594cb6033dd43d7c8ffb6ea4f2a94cc9851293284d65",
        },
      },
      {
        args: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.alternatives[2],
            datum: {
              type: EDatumType.INLINE,
              value:
                "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          error:
            "Inline datum types are not supported in V1 contracts! Convert this to a hash.",
        },
      },
      {
        args: {
          DestinationAddress: {
            datum: {
              type: "notvalid",
            },
            address: PREVIEW_DATA.addresses.alternatives[2],
          },
        },
        expectations: {
          error:
            "Could not find a matching datum type for the destination address. Aborting.",
        },
      },
      {
        args: {
          DestinationAddress: {
            address:
              "stake_test1uqxn89tuq7kdmhkvnzpy2ldz9uz7p5vf7l7ftvvh9ek4zpghgvr36",
            datum: {
              type: EDatumType.NONE,
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          error:
            "Invalid address. Make sure you are using a Bech32 encoded address that includes the payment key.",
        },
      },
      {
        args: {
          DestinationAddress: {
            address: "invalid",
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        // Specific to builder.
        expectations: {},
      },
      {
        args: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.alternatives[2],
            datum: {
              type: EDatumType.NONE,
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          error:
            "You supplied an invalid address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294. Please check your arguments and try again. Error message: The given address is not a Mainnet Network address: addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294.",
        },
      },
      {
        args: {
          DestinationAddress: {
            // Taken randomly from Cardanoscan
            address:
              "addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk",
            datum: {
              type: EDatumType.NONE,
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          error:
            "You supplied an invalid address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk. Please check your arguments and try again. Error message: The given address is not a (Preview/Testnet/PreProd) Network address: addr1qyh6eumj4qnjcu8grfj5p685h0dcj8erx4hj6dfst9vp03xeju03vcyu4zeemm6v9q38zth2wp6pnuma4pnl7axhj42szaqkjk.",
        },
      },
      {
        args: {
          DestinationAddress: {
            address:
              "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
            datum: {
              type: EDatumType.NONE,
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          error:
            "The address provided is a Script Address, but a datum hash was not supplied. This will brick your funds! Supply a valid datum hash with the address in order to proceed.",
        },
      },
      {
        args: {
          DestinationAddress: {
            address:
              "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
            datum: {
              type: EDatumType.HASH,
              value: "invalidDatum",
            },
          },
        } as TOrderAddressesArgs,
        expectations: {
          errorLucid:
            'The datum provided was not a valid hex string. Original error: {"datum":{"type":"HASH","value":"invalidDatum"}}',
          errorBlaze:
            'The datum provided was not a valid hex string. Original error: {"datum":{"type":"HASH","value":"invalidDatum"},"originalErrorMessage":"Invalid string: \\"expected hex string\\""}',
        },
      },
    ],
  },
  buildPoolIdent: [
    {
      args: PREVIEW_DATA.pools.v3.ident,
      expectations: {
        error:
          "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.",
      },
    },
    {
      args: PREVIEW_DATA.pools.v1.ident,
      expectations: {
        value: PREVIEW_DATA.pools.v1.ident,
      },
    },
  ],
  buildSwapDatum: [
    {
      args: {
        orderAddresses: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.current,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        ident: PREVIEW_DATA.pools.v1.ident,
        fundedAsset: new AssetAmount(
          10_000_000n,
          PREVIEW_DATA.assets.tada.metadata
        ),
        swap: {
          SuppliedCoin: EPoolCoin.A,
          MinimumReceivable: new AssetAmount(100n, {
            ...ADA_METADATA,
            assetId: PREVIEW_DATA.assets.tindy.metadata.assetId,
          }),
        },
        scooperFee: 1_000_000n,
      } as ISwapArguments,
      expectations: {
        inline:
          "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a000f4240d8799fd879801a00989680d8799f1864ffffff",
        hash: "a05ea9ede761983134b23116cc28ab676dbd417077f0b2e1ce47ff01a9d32933",
      },
    },
  ],
  buildWithdrawDatum: [
    {
      args: {
        orderAddresses: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.current,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        ident: PREVIEW_DATA.pools.v1.ident,
        suppliedLPAsset: new AssetAmount(
          100n,
          PREVIEW_DATA.assets.tada.metadata
        ),
        scooperFee: 1_000_000n,
      },
      expectations: {
        inline:
          "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a000f4240d87a9f1864ffff",
        hash: "fa14564c93f1af2e9db266be95d1631ab73133718449fd2df2855f53b73ef426",
      },
    },
  ],
};
