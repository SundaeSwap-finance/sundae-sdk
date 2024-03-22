import { Data } from "lucid-cardano";

export const PubKeyHashSchema = Data.Bytes({ minLength: 28, maxLength: 28 });
export type TPubKeyHash = Data.Static<typeof PubKeyHashSchema>;
export const PubKeyHash = PubKeyHashSchema as unknown as TPubKeyHash;

export const AssetClassSchema = Data.Object({
  policyId: Data.Bytes(),
  tokenName: Data.Bytes(),
});

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
export type TNodeKey = Data.Static<typeof NodeKeySchema>;
export const NodeKey = NodeKeySchema as unknown as TNodeKey;

export const SetNodeSchema = Data.Object({
  key: NodeKeySchema,
  next: NodeKeySchema,
});
export type TSetNode = Data.Static<typeof SetNodeSchema>;
export const SetNode = SetNodeSchema as unknown as TSetNode;

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

export const LiquidityNodeValidatorActionSchema = Data.Enum([
  Data.Literal("LinkedListAct"),
  Data.Literal("ModifyCommitment"),
  Data.Literal("CommitFoldAct"),
  Data.Literal("RewardFoldAct"),
]);
export type TLiquidityNodeValidatorAction = Data.Static<
  typeof LiquidityNodeValidatorActionSchema
>;
export const LiquidityNodeValidatorAction =
  LiquidityNodeValidatorActionSchema as unknown as TLiquidityNodeValidatorAction;

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
      outputIdxs: Data.Array(Data.Integer()),
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

export const RewardFoldActSchema = Data.Enum([
  Data.Object({
    RewardsFoldNodes: Data.Object({
      nodeIdxs: Data.Array(Data.Integer()),
      nodeOutIdxs: Data.Array(Data.Integer()),
    }),
  }),
  Data.Literal("RewardsFoldNode"),
  Data.Literal("RewardsReclaim"),
]);
export type TRewardFoldAct = Data.Static<typeof RewardFoldActSchema>;
export const RewardFoldAct = RewardFoldActSchema as unknown as TRewardFoldAct;

export const LiquiditySetNodeSchema = Data.Object({
  key: NodeKeySchema,
  next: NodeKeySchema,
  commitment: Data.Integer(),
});
export type TLiquiditySetNode = Data.Static<typeof LiquiditySetNodeSchema>;
export const LiquiditySetNode =
  LiquiditySetNodeSchema as unknown as TLiquiditySetNode;

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

export const StakingCredentialSchema = Data.Enum([
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
]);

export const LiquidityValidatorConfigSchema = Data.Object({
  discoveryDeadLine: Data.Integer(),
  penaltyAddress: AddressSchema,
  commitCredential: StakingCredentialSchema,
  rewardCredential: StakingCredentialSchema,
});
export type TLiquidityValidatorConfig = Data.Static<
  typeof LiquidityValidatorConfigSchema
>;
export const LBELockConfig =
  LiquidityValidatorConfigSchema as unknown as TLiquidityValidatorConfig;

export const LiquidityPolicyConfigSchema = Data.Object({
  initUTXO: OutputReferenceSchema,
  discoveryDeadLine: Data.Integer(),
  penaltyAddress: AddressSchema,
});
export type TLiquidityPolicyConfig = Data.Static<
  typeof LiquidityPolicyConfigSchema
>;
export const LiquidityPolicyConfig =
  LiquidityPolicyConfigSchema as unknown as TLiquidityPolicyConfig;

export const LiquidityFoldDatumSchema = Data.Object({
  currNode: LiquiditySetNodeSchema,
  committed: Data.Integer(),
  owner: AddressSchema,
});
export type TLiquidityFoldDatum = Data.Static<typeof LiquidityFoldDatumSchema>;
export const LiquidityFoldDatum =
  LiquidityFoldDatumSchema as unknown as TLiquidityFoldDatum;

export const LiquidityHolderDatumSchema = Data.Object({
  lpAssetName: Data.Bytes(),
  totalCommitted: Data.Integer(),
  totalLpTokens: Data.Integer(),
});
export type TLiquidityHolderDatum = Data.Static<
  typeof LiquidityHolderDatumSchema
>;
export const LiquidityHolderDatum =
  LiquidityHolderDatumSchema as unknown as TLiquidityHolderDatum;

export const LiquidityProxyDatumSchema = Data.Object({
  totalCommitted: Data.Integer(),
  returnAddress: AddressSchema,
});
export type TLiquidityProxyDatum = Data.Static<
  typeof LiquidityProxyDatumSchema
>;
export const LiquidityProxyDatum =
  LiquidityProxyDatumSchema as unknown as TLiquidityProxyDatum;

export const LiquidityRewardFoldDatumSchema = Data.Object({
  currNode: LiquiditySetNodeSchema,
  totalLPTokens: Data.Integer(),
  totalCommitted: Data.Integer(),
  owner: AddressSchema,
});
export type TLiquidityRewardFoldDatum = Data.Static<
  typeof LiquidityRewardFoldDatumSchema
>;
export const LiquidityRewardFoldDatum =
  LiquidityRewardFoldDatumSchema as unknown as TLiquidityRewardFoldDatum;

export const LiquidityFactoryDatumSchema = Data.Object({
  nextPoolIdent: Data.Bytes(),
  // Ignored
  proposalState: Data.Any(),
  scooperIdent: Data.Any(),
  scooperSet: Data.Any(),
});
export type TLiquidityFactoryDatum = Data.Static<
  typeof LiquidityFactoryDatumSchema
>;
export const LiquidityFactoryDatum =
  LiquidityFactoryDatumSchema as unknown as TLiquidityFactoryDatum;

export const LiquidityPoolDatumSchema = Data.Object({
  coins: Data.Object({
    coinA: AssetClassSchema,
    coinB: AssetClassSchema,
  }),
  poolIdent: Data.Bytes(),
  circulatingLP: Data.Integer(),
  swapFees: Data.Object({
    numerator: Data.Integer(),
    denominator: Data.Integer(),
  }),
});
export type TLiquidityPoolDatum = Data.Static<typeof LiquidityPoolDatumSchema>;
export const LiquidityPoolDatum =
  LiquidityPoolDatumSchema as unknown as TLiquidityPoolDatum;

export const CreatePoolRedeemerSchema = Data.Object({
  coinA: AssetClassSchema,
  coinB: AssetClassSchema,
});
export type TCreatePoolRedeemer = Data.Static<typeof CreatePoolRedeemerSchema>;
export const CreatePoolRedeemer =
  CreatePoolRedeemerSchema as unknown as TCreatePoolRedeemer;
