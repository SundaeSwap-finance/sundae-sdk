/* eslint-disable */
// @ts-nocheck
import { Exact, Type } from "@blaze-cardano/data";

const Contracts = Type.Module({
  Tuple$ByteArray_ByteArray: Type.Tuple([
    Type.String(),
    Type.String(),
  ]),
  Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray: Type.Tuple([
    Type.Ref("Tuple$ByteArray_ByteArray"),
    Type.Ref("Tuple$ByteArray_ByteArray"),
  ]),
  MultisigScript: Type.Union([
    Type.Object({
      Signature: Type.Object({
        keyHash: Type.String(),
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
        scriptHash: Type.String(),
      }, { ctor: 6n })
    }),
  ]),
  ConditionPoolDatum: Type.Object({
    identifier: Type.String(),
    assets: Type.Ref("Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray"),
    circulatingLp: Type.BigInt(),
    bidFeePer10Thousand: Type.BigInt(),
    askFeePer10Thousand: Type.BigInt(),
    feeManager: Type.Optional(Type.Ref("MultisigScript")),
    marketOpen: Type.BigInt(),
    protocolFee: Type.BigInt(),
    condition: Type.Optional(Type.String()),
    conditionDatum: Type.Optional(Type.Any()),
  }, { ctor: 0n }),
});

export const ConditionPoolDatum = Contracts.Import("ConditionPoolDatum");
export type ConditionPoolDatum = Exact<typeof ConditionPoolDatum>;
