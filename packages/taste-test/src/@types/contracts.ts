import { Exact, Type } from "@blaze-cardano/data";

const Contracts = Type.Module({
  PubKeyHash: Type.String({ minLength: 28, maxLength: 28 }),
  AssetClass: Type.Object({
    policyId: Type.String(),
    tokenName: Type.String(),
  }),
  OutputReference: Type.Object({
    txHash: Type.Object({
      hash: Type.String({ minLength: 32, maxLength: 32 }),
    }),
    outputIndex: Type.BigInt(),
  }),
  Credential: Type.Union([
    Type.Object(
      {
        PublicKeyCredential: Type.Tuple([
          Type.String({ minLength: 28, maxLength: 28 }),
        ]),
      },
      { ctor: 0n },
    ),
    Type.Object(
      {
        ScriptCredential: Type.Tuple([
          Type.String({ minLength: 28, maxLength: 28 }),
        ]),
      },
      { ctor: 1n },
    ),
  ]),
  Address: Type.Object({
    paymentCredential: Type.Ref("Credential"),
    stakeCredential: Type.Optional(
      Type.Union([
        Type.Object({ Inline: Type.Ref("Credential") }, { ctor: 0n }),
        Type.Object(
          {
            Pointer: Type.Tuple([
              Type.Object({
                slotNumber: Type.BigInt(),
                transactionIndex: Type.BigInt(),
                certificateIndex: Type.BigInt(),
              }),
            ]),
          },
          { ctor: 1n },
        ),
      ]),
    ),
  }),
  NodeKey: Type.String(),
  SetNode: Type.Object({
    key: Type.Optional(Type.Ref("NodeKey")),
    next: Type.Optional(Type.Ref("NodeKey")),
  }),
  DiscoveryConfig: Type.Object({
    initUTXO: Type.Ref("OutputReference"),
    maxRaise: Type.BigInt(),
    discoveryDeadLine: Type.BigInt(),
    penaltyAddress: Type.Ref("Address"),
  }),
  NodeValidatorAction: Type.Union([
    Type.Literal("LinkedListAct", { ctor: 0n }),
    Type.Literal("ModifyCommitment", { ctor: 1n }),
    Type.Literal("RewardFoldAct", { ctor: 2n }),
  ]),
  LiquidityNodeValidatorAction: Type.Union([
    Type.Literal("LinkedListAct", { ctor: 0n }),
    Type.Literal("ModifyCommitment", { ctor: 1n }),
    Type.Literal("CommitFoldAct", { ctor: 2n }),
    Type.Literal("RewardFoldAct", { ctor: 3n }),
    Type.Literal("ClaimAct", { ctor: 4n }),
  ]),
  FoldDatum: Type.Object({
    currNode: Type.Ref("SetNode"),
    committed: Type.BigInt(),
    owner: Type.Ref("Address"),
  }),
  FoldAct: Type.Union([
    Type.Object(
      {
        FoldNodes: Type.Object({
          nodeIdxs: Type.Array(Type.BigInt()),
          outputIdxs: Type.Array(Type.BigInt()),
        }),
      },
      { ctor: 0n },
    ),
    Type.Literal("Reclaim", { ctor: 1n }),
  ]),
  FoldMintAct: Type.Union([
    Type.Literal("MintFold", { ctor: 0n }),
    Type.Literal("BurnFold", { ctor: 1n }),
  ]),
  RewardFoldDatum: Type.Object({
    currNode: Type.Ref("SetNode"),
    totalProjectTokens: Type.BigInt(),
    totalCommitted: Type.BigInt(),
    owner: Type.Ref("Address"),
  }),
  RewardFoldAct: Type.Union([
    Type.Object(
      {
        RewardsFoldNodes: Type.Object({
          nodeIdxs: Type.Array(Type.BigInt()),
          nodeOutIdxs: Type.Array(Type.BigInt()),
        }),
      },
      { ctor: 0n },
    ),
    Type.Literal("RewardsFoldNode", { ctor: 1n }),
    Type.Literal("RewardsReclaim", { ctor: 2n }),
  ]),
  LiquiditySetNode: Type.Object({
    key: Type.Optional(Type.Ref("NodeKey")),
    next: Type.Optional(Type.Ref("NodeKey")),
    commitment: Type.BigInt(),
  }),
  LiquidityNodeAction: Type.Union([
    Type.Literal("PLInit", { ctor: 0n }),
    Type.Literal("PLDInit", { ctor: 1n }),
    Type.Object(
      {
        PInsert: Type.Object({
          keyToInsert: Type.Ref("PubKeyHash"),
          coveringNode: Type.Ref("LiquiditySetNode"),
        }),
      },
      { ctor: 2n },
    ),
    Type.Object(
      {
        PRemove: Type.Object({
          keyToRemove: Type.Ref("PubKeyHash"),
          coveringNode: Type.Ref("LiquiditySetNode"),
        }),
      },
      { ctor: 3n },
    ),
  ]),
  StakingCredential: Type.Union([
    Type.Object({ Inline: Type.Tuple([Type.Ref("Credential")]) }, { ctor: 0n }),
    Type.Object(
      {
        Pointer: Type.Tuple([
          Type.Object({
            slotNumber: Type.BigInt(),
            transactionIndex: Type.BigInt(),
            certificateIndex: Type.BigInt(),
          }),
        ]),
      },
      { ctor: 1n },
    ),
  ]),
  LiquidityValidatorConfig: Type.Object({
    discoveryDeadLine: Type.BigInt(),
    penaltyAddress: Type.Ref("Address"),
    commitCredential: Type.Ref("StakingCredential"),
    rewardCredential: Type.Ref("StakingCredential"),
  }),
  LiquidityPolicyConfig: Type.Object({
    initUTXO: Type.Ref("OutputReference"),
    discoveryDeadLine: Type.BigInt(),
    penaltyAddress: Type.Ref("Address"),
  }),
  LiquidityFoldDatum: Type.Object({
    currNode: Type.Ref("LiquiditySetNode"),
    committed: Type.BigInt(),
    owner: Type.Ref("Address"),
  }),
  LiquidityHolderDatum: Type.Object({
    lpAssetName: Type.String(),
    totalCommitted: Type.BigInt(),
    totalLpTokens: Type.BigInt(),
  }),
  LiquidityProxyDatum: Type.Object({
    totalCommitted: Type.BigInt(),
    returnAddress: Type.Ref("Address"),
  }),
  LiquidityRewardFoldDatum: Type.Object({
    currNode: Type.Ref("LiquiditySetNode"),
    totalLPTokens: Type.BigInt(),
    totalCommitted: Type.BigInt(),
    owner: Type.Ref("Address"),
  }),
  LiquidityFactoryDatum: Type.Object({
    nextPoolIdent: Type.String(),
    // Ignored
    proposalState: Type.Any(),
    scooperIdent: Type.Any(),
    scooperSet: Type.Any(),
  }),
  LiquidityPoolDatum: Type.Object({
    coins: Type.Object({
      coinA: Type.Ref("AssetClass"),
      coinB: Type.Ref("AssetClass"),
    }),
    poolIdent: Type.String(),
    circulatingLP: Type.BigInt(),
    swapFees: Type.Object({
      numerator: Type.BigInt(),
      denominator: Type.BigInt(),
    }),
  }),
  CreatePoolRedeemer: Type.Object({
    coinA: Type.Ref("AssetClass"),
    coinB: Type.Ref("AssetClass"),
  }),
});

export const PubKeyHash = Contracts.Import("PubKeyHash");
export type TPubKeyHash = Exact<typeof PubKeyHash>;
export const OutputReference = Contracts.Import("OutputReference");
export type TOutputReference = Exact<typeof OutputReference>;
export const CredentialD = Contracts.Import("Credential");
export type TCredentialD = Exact<typeof CredentialD>;
export const AddressD = Contracts.Import("Address");
export type TAddressD = Exact<typeof AddressD>;
export const NodeKey = Contracts.Import("NodeKey");
export type TNodeKey = Exact<typeof NodeKey>;
export const SetNode = Contracts.Import("SetNode");
export type TSetNode = Exact<typeof SetNode>;
export const DiscoveryConfig = Contracts.Import("DiscoveryConfig");
export type TDiscoveryConfig = Exact<typeof DiscoveryConfig>;
export const NodeValidatorAction = Contracts.Import("NodeValidatorAction");
export type TNodeValidatorAction = Exact<typeof NodeValidatorAction>;
export const LiquidityNodeValidatorAction = Contracts.Import(
  "LiquidityNodeValidatorAction",
);
export type TLiquidityNodeValidatorAction = Exact<
  typeof LiquidityNodeValidatorAction
>;
export const FoldDatum = Contracts.Import("FoldDatum");
export type TFoldDatum = Exact<typeof FoldDatum>;
export const FoldAct = Contracts.Import("FoldAct");
export type TFoldAct = Exact<typeof FoldAct>;
export const FoldMintAct = Contracts.Import("FoldMintAct");
export type TFoldMintAct = Exact<typeof FoldMintAct>;
export const RewardFoldDatum = Contracts.Import("RewardFoldDatum");
export type TRewardFoldDatum = Exact<typeof RewardFoldDatum>;
export const RewardFoldAct = Contracts.Import("RewardFoldAct");
export type TRewardFoldAct = Exact<typeof RewardFoldAct>;
export const LiquiditySetNode = Contracts.Import("LiquiditySetNode");
export type TLiquiditySetNode = Exact<typeof LiquiditySetNode>;
export const LiquidityNodeAction = Contracts.Import("LiquidityNodeAction");
export type TLiquidityNodeAction = Exact<typeof LiquidityNodeAction>;
export const LBELockConfig = Contracts.Import("LiquidityValidatorConfig");
export type TLiquidityValidatorConfig = Exact<typeof LBELockConfig>;
export const LiquidityPolicyConfig = Contracts.Import("LiquidityPolicyConfig");
export type TLiquidityPolicyConfig = Exact<typeof LiquidityPolicyConfig>;
export const LiquidityFoldDatum = Contracts.Import("LiquidityFoldDatum");
export type TLiquidityFoldDatum = Exact<typeof LiquidityFoldDatum>;
export const LiquidityHolderDatum = Contracts.Import("LiquidityHolderDatum");
export type TLiquidityHolderDatum = Exact<typeof LiquidityHolderDatum>;
export const LiquidityProxyDatum = Contracts.Import("LiquidityProxyDatum");
export type TLiquidityProxyDatum = Exact<typeof LiquidityProxyDatum>;
export const LiquidityRewardFoldDatum = Contracts.Import(
  "LiquidityRewardFoldDatum",
);
export type TLiquidityRewardFoldDatum = Exact<typeof LiquidityRewardFoldDatum>;
export const LiquidityFactoryDatum = Contracts.Import("LiquidityFactoryDatum");
export type TLiquidityFactoryDatum = Exact<typeof LiquidityFactoryDatum>;
export const LiquidityPoolDatum = Contracts.Import("LiquidityPoolDatum");
export type TLiquidityPoolDatum = Exact<typeof LiquidityPoolDatum>;
export const CreatePoolRedeemer = Contracts.Import("CreatePoolRedeemer");
export type TCreatePoolRedeemer = Exact<typeof CreatePoolRedeemer>;
