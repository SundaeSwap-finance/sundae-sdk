import { Data } from "lucid-cardano";

export const PubKeyHashSchema = Data.Bytes({ minLength: 28, maxLength: 28 });
export type TPubKeyHash = Data.Static<typeof PubKeyHashSchema>;
export const PubKeyHash = PubKeyHashSchema as unknown as TPubKeyHash;

export const OutputReferenceSchema = Data.Object({
  txHash: Data.Object({ hash: Data.Bytes({ minLength: 32, maxLength: 32 }) }),
  outputIndex: Data.Integer(),
});
export type TOutputReference = Data.Static<typeof OutputReferenceSchema>;
export const OutputReference =
  OutputReferenceSchema as unknown as TOutputReference;

export const CredentialSchema = Data.Enum([
  Data.Object({
    PublicKeyCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 }),
    ]),
  }),
  Data.Object({
    ScriptCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 }),
    ]),
  }),
]);
export type TCredentialD = Data.Static<typeof CredentialSchema>;
export const CredentialD = CredentialSchema as unknown as TCredentialD;

export const AddressSchema = Data.Object({
  paymentCredential: CredentialSchema,
  stakeCredential: Data.Nullable(
    Data.Enum([
      Data.Object({ Inline: Data.Tuple([CredentialSchema]) }),
      Data.Object({
        Pointer: Data.Tuple([
          Data.Object({
            slotNumber: Data.Integer(),
            transactionIndex: Data.Integer(),
            certificateIndex: Data.Integer(),
          }),
        ]),
      }),
    ])
  ),
});
export type TAddressD = Data.Static<typeof AddressSchema>;
export const AddressD = AddressSchema as unknown as TAddressD;

export const NodeKeySchema = Data.Nullable(Data.Bytes());
export type TNodeKeySchema = Data.Static<typeof NodeKeySchema>;

export type TNodeKey = Data.Static<typeof NodeKeySchema>;
export const NodeKey = NodeKeySchema as unknown as TNodeKey;

export const LiquiditySetNodeSchema = Data.Object({
  key: NodeKeySchema,
  next: NodeKeySchema,
  commitment: Data.Integer(),
});
export type TLiquiditySetNode = Data.Static<typeof LiquiditySetNodeSchema>;
export const LiquiditySetNode =
  LiquiditySetNodeSchema as unknown as TLiquiditySetNode;

export const SetNodeSchema = Data.Object({
  key: NodeKeySchema,
  next: NodeKeySchema,
});
export type TSetNode = Data.Static<typeof SetNodeSchema>;
export const SetNode = SetNodeSchema as unknown as TSetNode;

export const LiquidityNodeActionSchema = Data.Enum([
  Data.Literal("PLInit"),
  Data.Literal("PLDInit"),
  Data.Object({
    PInsert: Data.Object({
      keyToInsert: PubKeyHashSchema,
      coveringNode: LiquiditySetNodeSchema,
    }),
  }),
  Data.Object({
    PRemove: Data.Object({
      keyToRemove: PubKeyHashSchema,
      coveringNode: LiquiditySetNodeSchema,
    }),
  }),
]);
export type TLiquidityNodeAction = Data.Static<
  typeof LiquidityNodeActionSchema
>;
export const LiquidityNodeAction =
  LiquidityNodeActionSchema as unknown as TLiquidityNodeAction;

export const DiscoveryNodeActionSchema = Data.Enum([
  Data.Literal("PInit"),
  Data.Literal("PDInit"),
  Data.Object({
    PInsert: Data.Object({
      keyToInsert: PubKeyHashSchema,
      coveringNode: SetNodeSchema,
    }),
  }),
  Data.Object({
    PRemove: Data.Object({
      keyToRemove: PubKeyHashSchema,
      coveringNode: SetNodeSchema,
    }),
  }),
]);
export type TDiscoveryNodeAction = Data.Static<
  typeof DiscoveryNodeActionSchema
>;
export const DiscoveryNodeAction =
  DiscoveryNodeActionSchema as unknown as TDiscoveryNodeAction;
export const DiscoveryConfigSchema = Data.Object({
  initUTXO: OutputReferenceSchema,
  maxRaise: Data.Integer(),
  discoveryDeadLine: Data.Integer(),
  penaltyAddress: AddressSchema,
});
export type TDiscoveryConfig = Data.Static<typeof DiscoveryConfigSchema>;
export const DiscoveryConfig =
  DiscoveryConfigSchema as unknown as TDiscoveryConfig;

export const NodeValidatorActionSchema = Data.Enum([
  Data.Literal("LinkedListAct"),
  Data.Literal("ModifyCommitment"),
  Data.Literal("RewardFoldAct"),
]);
export type TNodeValidatorAction = Data.Static<
  typeof NodeValidatorActionSchema
>;
export const NodeValidatorAction =
  NodeValidatorActionSchema as unknown as TNodeValidatorAction;

export const FoldDatumSchema = Data.Object({
  currNode: SetNodeSchema,
  committed: Data.Integer(),
  owner: AddressSchema,
});
export type TFoldDatum = Data.Static<typeof FoldDatumSchema>;
export const FoldDatum = FoldDatumSchema as unknown as TFoldDatum;

export const FoldActSchema = Data.Enum([
  Data.Object({
    FoldNodes: Data.Object({
      nodeIdxs: Data.Array(Data.Integer()),
    }),
  }),
  Data.Literal("Reclaim"),
]);
export type TFoldAct = Data.Static<typeof FoldActSchema>;
export const FoldAct = FoldActSchema as unknown as TFoldAct;

export const FoldMintActSchema = Data.Enum([
  Data.Literal("MintFold"),
  Data.Literal("BurnFold"),
]);
export type TFoldMintAct = Data.Static<typeof FoldMintActSchema>;
export const FoldMintAct = FoldMintActSchema as unknown as TFoldMintAct;

export const RewardFoldDatumSchema = Data.Object({
  currNode: SetNodeSchema,
  totalProjectTokens: Data.Integer(),
  totalCommitted: Data.Integer(),
  owner: AddressSchema,
});
export type TRewardFoldDatum = Data.Static<typeof RewardFoldDatumSchema>;
export const RewardFoldDatum =
  RewardFoldDatumSchema as unknown as TRewardFoldDatum;
