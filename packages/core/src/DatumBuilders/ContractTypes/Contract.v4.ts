/* eslint-disable */
// @ts-nocheck
/**
 * sundae-v4 contract types (order + pool subtree).
 *
 * Ported from sundae-v4's generated `blueprint.ts` (itself produced from
 * `plutus.json` by `@blaze-cardano/blueprint`), so these mirror the compiled
 * validators' interface exactly. Field NAMES are kept snake_case to match the
 * blueprint verbatim — Plutus constr encoding is positional, so names are just
 * labels and do not affect the wire format; matching the blueprint minimises
 * transcription risk when cross-referencing.
 *
 * Scope: only the types reachable from `OrderDatum` and `PoolDatum` are ported
 * here (what the DatumBuilder needs). The governance / tranche / dispatcher /
 * treasury / fairness types in the full blueprint are intentionally omitted.
 *
 * NOTE: the per-constraint `data` payloads carried in `OrderDatum.constraints`
 * (e.g. the swap/deposit/withdraw constraint fields) are NOT part of the
 * blueprint — on-chain they are opaque `Data` decoded by each withdraw module.
 * Those encoders are deliberately not defined here yet; see DatumBuilderV4.
 */
import { type PlutusData } from "@blaze-cardano/core";
import { Exact, Type } from "@blaze-cardano/data";

type Data = PlutusData;

const Contracts = Type.Module({
  Bool: Type.Boolean(),
  Tuple_ByteArray_Data: Type.Tuple([
    Type.String(),
    Type.Unsafe<PlutusData>(Type.Any()),
  ]),
  Tuple_AssetClass_Int: Type.Tuple([
    Type.Ref("AssetClass"),
    Type.BigInt(),
  ]),
  Tuple_ModuleHash_ByteArray: Type.Tuple([
    Type.Ref("ModuleHash"),
    Type.String(),
  ]),
  MultisigScript: Type.Union([
    Type.Object({
      Signature: Type.Object({
        key_hash: Type.String(),
      }, { ctor: 0n })
    }),
    Type.Object({
      AllOf: Type.Object({
        scripts: Type.Array(
          Type.Ref("MultisigScript")
        ),
      }, { ctor: 1n })
    }),
    Type.Object({
      AnyOf: Type.Object({
        scripts: Type.Array(
          Type.Ref("MultisigScript")
        ),
      }, { ctor: 2n })
    }),
    Type.Object({
      AtLeast: Type.Object({
        required: Type.BigInt(),
        scripts: Type.Array(
          Type.Ref("MultisigScript")
        ),
      }, { ctor: 3n })
    }),
    Type.Object({
      Before: Type.Object({
        time: Type.BigInt(),
      }, { ctor: 4n })
    }),
    Type.Object({
      After: Type.Object({
        time: Type.BigInt(),
      }, { ctor: 5n })
    }),
    Type.Object({
      Script: Type.Object({
        script_hash: Type.String(),
      }, { ctor: 6n })
    }),
  ]),
  AssetClass: Type.Object({
    policy: Type.String(),
    name: Type.String(),
  }, { ctor: 0n }),
  Destination: Type.Union([
    Type.Object({
      Fixed: Type.Object({
        address: Type.Object({
          payment_credential: Type.Union([
            Type.Object({
              VerificationKey: Type.Tuple([
                Type.String(),
              ], { ctor: 0n })
            }),
            Type.Object({
              Script: Type.Tuple([
                Type.String(),
              ], { ctor: 1n })
            }),
          ]),
          stake_credential: Type.Optional(
            Type.Union([
              Type.Object({
                Inline: Type.Tuple([
                  Type.Union([
                    Type.Object({
                      VerificationKey: Type.Tuple([
                        Type.String(),
                      ], { ctor: 0n })
                    }),
                    Type.Object({
                      Script: Type.Tuple([
                        Type.String(),
                      ], { ctor: 1n })
                    }),
                  ]),
                ], { ctor: 0n })
              }),
              Type.Object({
                Pointer: Type.Object({
                  slot_number: Type.BigInt(),
                  transaction_index: Type.BigInt(),
                  certificate_index: Type.BigInt(),
                }, { ctor: 1n })
              }),
            ])
          ),
        }, { ctor: 0n }),
        datum: Type.Optional(
          Type.Unsafe<PlutusData>(Type.Any())
        ),
      }, { ctor: 0n })
    }),
    Type.Literal("Self", { ctor: 1n }),
  ]),
  Ident: Type.String(),
  ModuleHash: Type.String(),
  Rational: Type.Object({
    num: Type.BigInt(),
    den: Type.BigInt(),
  }, { ctor: 0n }),
  ConstantSumConfig: Type.Object({
    prices: Type.Array(
      Type.BigInt()
    ),
    fee: Type.Ref("Rational"),
    bounty_k: Type.Ref("Rational"),
    waive_fee_on_claim: Type.Ref("Bool"),
  }, { ctor: 0n }),
  FeeSplitConfig: Type.Object({
    protocol_share: Type.Ref("Rational"),
  }, { ctor: 0n }),
  ActionEntry: Type.Object({
    tag: Type.BigInt(),
    enabled: Type.Ref("Bool"),
    modules: Type.Array(
      Type.Ref("ModuleHash")
    ),
  }, { ctor: 0n }),
  PoolConfig: Type.Object({
    pool_validator: Type.Ref("ModuleHash"),
    actions: Type.Array(
      Type.Ref("ActionEntry")
    ),
  }, { ctor: 0n }),
  PoolState: Type.Object({
    assets: Type.Array(
      Type.Ref("Tuple_AssetClass_Int")
    ),
    total_lp: Type.BigInt(),
    circulating_lp: Type.BigInt(),
    preminted_lp: Type.BigInt(),
  }, { ctor: 0n }),
  PoolDatum: Type.Object({
    assets: Type.Array(
      Type.Ref("Tuple_AssetClass_Int")
    ),
    total_lp: Type.BigInt(),
    circulating_lp: Type.BigInt(),
    preminted_lp: Type.BigInt(),
    identifier: Type.Ref("Ident"),
    actions: Type.Array(
      Type.Ref("ActionEntry")
    ),
    module_state: Type.Array(
      Type.Ref("Tuple_ModuleHash_ByteArray")
    ),
  }, { ctor: 0n }),
  OrderDatum: Type.Object({
    owner: Type.Ref("MultisigScript"),
    destination: Type.Ref("Destination"),
    budget: Type.BigInt(),
    share_batcher: Type.BigInt(),
    config_token: Type.String(),
    constraints: Type.Array(
      Type.Ref("Tuple_ByteArray_Data")
    ),
    extension: Type.Unsafe<PlutusData>(Type.Any()),
  }, { ctor: 0n }),
});

export const Tuple_ByteArray_Data = Contracts.Import("Tuple_ByteArray_Data");
export type Tuple_ByteArray_Data = Exact<typeof Tuple_ByteArray_Data>;
export const Tuple_AssetClass_Int = Contracts.Import("Tuple_AssetClass_Int");
export type Tuple_AssetClass_Int = Exact<typeof Tuple_AssetClass_Int>;
export const Tuple_ModuleHash_ByteArray = Contracts.Import("Tuple_ModuleHash_ByteArray");
export type Tuple_ModuleHash_ByteArray = Exact<typeof Tuple_ModuleHash_ByteArray>;
export const MultisigScript = Contracts.Import("MultisigScript");
export type MultisigScript = Exact<typeof MultisigScript>;
export const AssetClass = Contracts.Import("AssetClass");
export type AssetClass = Exact<typeof AssetClass>;
export const Destination = Contracts.Import("Destination");
export type Destination = Exact<typeof Destination>;
export const Ident = Contracts.Import("Ident");
export type Ident = Exact<typeof Ident>;
export const ModuleHash = Contracts.Import("ModuleHash");
export type ModuleHash = Exact<typeof ModuleHash>;
export const Rational = Contracts.Import("Rational");
export type Rational = Exact<typeof Rational>;
export const ConstantSumConfig = Contracts.Import("ConstantSumConfig");
export type ConstantSumConfig = Exact<typeof ConstantSumConfig>;
export const FeeSplitConfig = Contracts.Import("FeeSplitConfig");
export type FeeSplitConfig = Exact<typeof FeeSplitConfig>;
export const ActionEntry = Contracts.Import("ActionEntry");
export type ActionEntry = Exact<typeof ActionEntry>;
export const PoolConfig = Contracts.Import("PoolConfig");
export type PoolConfig = Exact<typeof PoolConfig>;
export const PoolState = Contracts.Import("PoolState");
export type PoolState = Exact<typeof PoolState>;
export const PoolDatum = Contracts.Import("PoolDatum");
export type PoolDatum = Exact<typeof PoolDatum>;
export const OrderDatum = Contracts.Import("OrderDatum");
export type OrderDatum = Exact<typeof OrderDatum>;
