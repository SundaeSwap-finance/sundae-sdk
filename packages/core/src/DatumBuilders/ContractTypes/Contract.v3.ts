/* eslint-disable */
import { type PlutusData } from "@blaze-cardano/core";
import { Exact, Type } from "@blaze-cardano/data";

const Contracts = Type.Module({
  Bool: Type.Boolean(),
  RedeemerWrapper$Data: Type.Object(
    {
      Wrapper: Type.Unsafe<PlutusData>(Type.Any()),
    },
    { ctor: 1n },
  ),
  RedeemerWrapper$PoolRedeemer: Type.Object(
    {
      Wrapper: Type.Ref("PoolRedeemer"),
    },
    { ctor: 1n },
  ),
  RedeemerWrapper$SettingsRedeemer: Type.Object(
    {
      Wrapper: Type.Ref("SettingsRedeemer"),
    },
    { ctor: 1n },
  ),
  Tuple$ByteArray_ByteArray: Type.Tuple([Type.String(), Type.String()]),
  Tuple$ByteArray_ByteArray_Int: Type.Tuple([
    Type.String(),
    Type.String(),
    Type.BigInt(),
  ]),
  Tuple$Int_Int: Type.Tuple([Type.BigInt(), Type.BigInt()]),
  Tuple$Int_Option$SignedStrategyExecution_Int: Type.Tuple([
    Type.BigInt(),
    Type.Optional(Type.Ref("SignedStrategyExecution")),
    Type.BigInt(),
  ]),
  Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int: Type.Tuple(
    [
      Type.Ref("Tuple$ByteArray_ByteArray_Int"),
      Type.Ref("Tuple$ByteArray_ByteArray_Int"),
    ],
  ),
  Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray: Type.Tuple([
    Type.Ref("Tuple$ByteArray_ByteArray"),
    Type.Ref("Tuple$ByteArray_ByteArray"),
  ]),
  MultisigScript: Type.Union([
    Type.Object({
      Signature: Type.Object(
        {
          keyHash: Type.String(),
        },
        { ctor: 0n },
      ),
    }),
    Type.Object({
      AllOf: Type.Object(
        {
          scripts: Type.Array(Type.Ref("MultisigScript")),
        },
        { ctor: 1n },
      ),
    }),
    Type.Object({
      AnyOf: Type.Object(
        {
          scripts: Type.Array(Type.Ref("MultisigScript")),
        },
        { ctor: 2n },
      ),
    }),
    Type.Object({
      AtLeast: Type.Object(
        {
          required: Type.BigInt(),
          scripts: Type.Array(Type.Ref("MultisigScript")),
        },
        { ctor: 3n },
      ),
    }),
    Type.Object({
      Before: Type.Object(
        {
          time: Type.BigInt(),
        },
        { ctor: 4n },
      ),
    }),
    Type.Object({
      After: Type.Object(
        {
          time: Type.BigInt(),
        },
        { ctor: 5n },
      ),
    }),
    Type.Object({
      Script: Type.Object(
        {
          scriptHash: Type.String(),
        },
        { ctor: 6n },
      ),
    }),
  ]),
  OracleDatum: Type.Object(
    {
      owner: Type.Ref("MultisigScript"),
      validRange: Type.Object(
        {
          lowerBound: Type.Object(
            {
              boundType: Type.Union([
                Type.Literal("NegativeInfinity", { ctor: 0n }),
                Type.Object({
                  Finite: Type.Tuple([Type.BigInt()], { ctor: 1n }),
                }),
                Type.Literal("PositiveInfinity", { ctor: 2n }),
              ]),
              isInclusive: Type.Ref("Bool"),
            },
            { ctor: 0n },
          ),
          upperBound: Type.Object(
            {
              boundType: Type.Union([
                Type.Literal("NegativeInfinity", { ctor: 0n }),
                Type.Object({
                  Finite: Type.Tuple([Type.BigInt()], { ctor: 1n }),
                }),
                Type.Literal("PositiveInfinity", { ctor: 2n }),
              ]),
              isInclusive: Type.Ref("Bool"),
            },
            { ctor: 0n },
          ),
        },
        { ctor: 0n },
      ),
      poolIdent: Type.String(),
      reserveA: Type.Ref("Tuple$ByteArray_ByteArray_Int"),
      reserveB: Type.Ref("Tuple$ByteArray_ByteArray_Int"),
      circulatingLp: Type.Ref("Tuple$ByteArray_ByteArray_Int"),
    },
    { ctor: 0n },
  ),
  OracleRedeemer: Type.Union([
    Type.Object({
      Mint: Type.Tuple([Type.String(), Type.Array(Type.BigInt())], {
        ctor: 0n,
      }),
    }),
    Type.Literal("Burn", { ctor: 1n }),
  ]),
  Destination: Type.Union([
    Type.Object({
      Fixed: Type.Object(
        {
          address: Type.Object(
            {
              paymentCredential: Type.Union([
                Type.Object({
                  VerificationKeyCredential: Type.Tuple([Type.String()], {
                    ctor: 0n,
                  }),
                }),
                Type.Object({
                  ScriptCredential: Type.Tuple([Type.String()], { ctor: 1n }),
                }),
              ]),
              stakeCredential: Type.Optional(
                Type.Union([
                  Type.Object({
                    Inline: Type.Tuple(
                      [
                        Type.Union([
                          Type.Object({
                            VerificationKeyCredential: Type.Tuple(
                              [Type.String()],
                              { ctor: 0n },
                            ),
                          }),
                          Type.Object({
                            ScriptCredential: Type.Tuple([Type.String()], {
                              ctor: 1n,
                            }),
                          }),
                        ]),
                      ],
                      { ctor: 0n },
                    ),
                  }),
                  Type.Object({
                    Pointer: Type.Object(
                      {
                        slotNumber: Type.BigInt(),
                        transactionIndex: Type.BigInt(),
                        certificateIndex: Type.BigInt(),
                      },
                      { ctor: 1n },
                    ),
                  }),
                ]),
              ),
            },
            { ctor: 0n },
          ),
          datum: Type.Union([
            Type.Literal("NoDatum", { ctor: 0n }),
            Type.Object({
              DatumHash: Type.Tuple([Type.String()], { ctor: 1n }),
            }),
            Type.Object({
              InlineDatum: Type.Tuple([Type.Unsafe<PlutusData>(Type.Any())], {
                ctor: 2n,
              }),
            }),
          ]),
        },
        { ctor: 0n },
      ),
    }),
    Type.Literal("Self", { ctor: 1n }),
  ]),
  Order: Type.Union([
    Type.Object({
      Strategy: Type.Object(
        {
          auth: Type.Ref("StrategyAuthorization"),
        },
        { ctor: 0n },
      ),
    }),
    Type.Object({
      Swap: Type.Object(
        {
          offer: Type.Ref("Tuple$ByteArray_ByteArray_Int"),
          minReceived: Type.Ref("Tuple$ByteArray_ByteArray_Int"),
        },
        { ctor: 1n },
      ),
    }),
    Type.Object({
      Deposit: Type.Object(
        {
          assets: Type.Ref(
            "Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int",
          ),
        },
        { ctor: 2n },
      ),
    }),
    Type.Object({
      Withdrawal: Type.Object(
        {
          amount: Type.Ref("Tuple$ByteArray_ByteArray_Int"),
        },
        { ctor: 3n },
      ),
    }),
    Type.Object({
      Donation: Type.Object(
        {
          assets: Type.Ref(
            "Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int",
          ),
        },
        { ctor: 4n },
      ),
    }),
    Type.Object({
      Record: Type.Object(
        {
          policy: Type.Ref("Tuple$ByteArray_ByteArray"),
        },
        { ctor: 5n },
      ),
    }),
  ]),
  OrderDatum: Type.Object(
    {
      poolIdent: Type.Optional(Type.String()),
      owner: Type.Ref("MultisigScript"),
      maxProtocolFee: Type.BigInt(),
      destination: Type.Ref("Destination"),
      details: Type.Ref("Order"),
      extension: Type.Unsafe<PlutusData>(Type.Any()),
    },
    { ctor: 0n },
  ),
  OrderRedeemer: Type.Union([
    Type.Literal("Scoop", { ctor: 0n }),
    Type.Literal("Cancel", { ctor: 1n }),
  ]),
  SignedStrategyExecution: Type.Object(
    {
      execution: Type.Ref("StrategyExecution"),
      signature: Type.Optional(Type.String()),
    },
    { ctor: 0n },
  ),
  StrategyAuthorization: Type.Union([
    Type.Object({
      Signature: Type.Object(
        {
          signer: Type.String(),
        },
        { ctor: 0n },
      ),
    }),
    Type.Object({
      Script: Type.Object(
        {
          script: Type.String(),
        },
        { ctor: 1n },
      ),
    }),
  ]),
  StrategyExecution: Type.Object(
    {
      txRef: Type.Object(
        {
          transactionId: Type.Object(
            {
              hash: Type.String(),
            },
            { ctor: 0n },
          ),
          outputIndex: Type.BigInt(),
        },
        { ctor: 0n },
      ),
      validityRange: Type.Object(
        {
          lowerBound: Type.Object(
            {
              boundType: Type.Union([
                Type.Literal("NegativeInfinity", { ctor: 0n }),
                Type.Object({
                  Finite: Type.Tuple([Type.BigInt()], { ctor: 1n }),
                }),
                Type.Literal("PositiveInfinity", { ctor: 2n }),
              ]),
              isInclusive: Type.Ref("Bool"),
            },
            { ctor: 0n },
          ),
          upperBound: Type.Object(
            {
              boundType: Type.Union([
                Type.Literal("NegativeInfinity", { ctor: 0n }),
                Type.Object({
                  Finite: Type.Tuple([Type.BigInt()], { ctor: 1n }),
                }),
                Type.Literal("PositiveInfinity", { ctor: 2n }),
              ]),
              isInclusive: Type.Ref("Bool"),
            },
            { ctor: 0n },
          ),
        },
        { ctor: 0n },
      ),
      details: Type.Ref("Order"),
      extensions: Type.Unsafe<PlutusData>(Type.Any()),
    },
    { ctor: 0n },
  ),
  ManageRedeemer: Type.Union([
    Type.Object({
      WithdrawFees: Type.Object(
        {
          amount: Type.BigInt(),
          treasuryOutput: Type.BigInt(),
          poolInput: Type.BigInt(),
        },
        { ctor: 0n },
      ),
    }),
    Type.Object({
      UpdatePoolFees: Type.Object(
        {
          poolInput: Type.BigInt(),
        },
        { ctor: 1n },
      ),
    }),
  ]),
  PoolDatum: Type.Object(
    {
      identifier: Type.String(),
      assets: Type.Ref(
        "Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray",
      ),
      circulatingLp: Type.BigInt(),
      bidFeesPer_10Thousand: Type.BigInt(),
      askFeesPer_10Thousand: Type.BigInt(),
      feeManager: Type.Optional(Type.Ref("MultisigScript")),
      marketOpen: Type.BigInt(),
      protocolFees: Type.BigInt(),
    },
    { ctor: 0n },
  ),
  PoolMintRedeemer: Type.Union([
    Type.Object({
      MintLP: Type.Object(
        {
          identifier: Type.String(),
        },
        { ctor: 0n },
      ),
    }),
    Type.Object({
      CreatePool: Type.Object(
        {
          assets: Type.Ref(
            "Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray",
          ),
          poolOutput: Type.BigInt(),
          metadataOutput: Type.BigInt(),
        },
        { ctor: 1n },
      ),
    }),
    Type.Object({
      BurnPool: Type.Object(
        {
          identifier: Type.String(),
        },
        { ctor: 2n },
      ),
    }),
  ]),
  PoolRedeemer: Type.Union([
    Type.Object({
      PoolScoop: Type.Object(
        {
          signatoryIndex: Type.BigInt(),
          scooperIndex: Type.BigInt(),
          inputOrder: Type.Array(
            Type.Ref("Tuple$Int_Option$SignedStrategyExecution_Int"),
          ),
        },
        { ctor: 0n },
      ),
    }),
    Type.Literal("Manage", { ctor: 1n }),
  ]),
  SettingsDatum: Type.Object(
    {
      settingsAdmin: Type.Ref("MultisigScript"),
      metadataAdmin: Type.Object(
        {
          paymentCredential: Type.Union([
            Type.Object({
              VerificationKeyCredential: Type.Tuple([Type.String()], {
                ctor: 0n,
              }),
            }),
            Type.Object({
              ScriptCredential: Type.Tuple([Type.String()], { ctor: 1n }),
            }),
          ]),
          stakeCredential: Type.Optional(
            Type.Union([
              Type.Object({
                Inline: Type.Tuple(
                  [
                    Type.Union([
                      Type.Object({
                        VerificationKeyCredential: Type.Tuple([Type.String()], {
                          ctor: 0n,
                        }),
                      }),
                      Type.Object({
                        ScriptCredential: Type.Tuple([Type.String()], {
                          ctor: 1n,
                        }),
                      }),
                    ]),
                  ],
                  { ctor: 0n },
                ),
              }),
              Type.Object({
                Pointer: Type.Object(
                  {
                    slotNumber: Type.BigInt(),
                    transactionIndex: Type.BigInt(),
                    certificateIndex: Type.BigInt(),
                  },
                  { ctor: 1n },
                ),
              }),
            ]),
          ),
        },
        { ctor: 0n },
      ),
      treasuryAdmin: Type.Ref("MultisigScript"),
      treasuryAddress: Type.Object(
        {
          paymentCredential: Type.Union([
            Type.Object({
              VerificationKeyCredential: Type.Tuple([Type.String()], {
                ctor: 0n,
              }),
            }),
            Type.Object({
              ScriptCredential: Type.Tuple([Type.String()], { ctor: 1n }),
            }),
          ]),
          stakeCredential: Type.Optional(
            Type.Union([
              Type.Object({
                Inline: Type.Tuple(
                  [
                    Type.Union([
                      Type.Object({
                        VerificationKeyCredential: Type.Tuple([Type.String()], {
                          ctor: 0n,
                        }),
                      }),
                      Type.Object({
                        ScriptCredential: Type.Tuple([Type.String()], {
                          ctor: 1n,
                        }),
                      }),
                    ]),
                  ],
                  { ctor: 0n },
                ),
              }),
              Type.Object({
                Pointer: Type.Object(
                  {
                    slotNumber: Type.BigInt(),
                    transactionIndex: Type.BigInt(),
                    certificateIndex: Type.BigInt(),
                  },
                  { ctor: 1n },
                ),
              }),
            ]),
          ),
        },
        { ctor: 0n },
      ),
      treasuryAllowance: Type.Ref("Tuple$Int_Int"),
      authorizedScoopers: Type.Optional(Type.Array(Type.String())),
      authorizedStakingKeys: Type.Array(
        Type.Union([
          Type.Object({
            VerificationKeyCredential: Type.Tuple([Type.String()], {
              ctor: 0n,
            }),
          }),
          Type.Object({
            ScriptCredential: Type.Tuple([Type.String()], { ctor: 1n }),
          }),
        ]),
      ),
      baseFee: Type.BigInt(),
      simpleFee: Type.BigInt(),
      strategyFee: Type.BigInt(),
      poolCreationFee: Type.BigInt(),
      extensions: Type.Unsafe<PlutusData>(Type.Any()),
    },
    { ctor: 0n },
  ),
  SettingsRedeemer: Type.Union([
    Type.Literal("SettingsAdminUpdate", { ctor: 0n }),
    Type.Literal("TreasuryAdminUpdate", { ctor: 1n }),
  ]),
});

export const Bool = Contracts.Import("Bool");
export type Bool = Exact<typeof Bool>;
export const RedeemerWrapper$Data = Contracts.Import("RedeemerWrapper$Data");
export type RedeemerWrapper$Data = Exact<typeof RedeemerWrapper$Data>;
export const RedeemerWrapper$PoolRedeemer = Contracts.Import(
  "RedeemerWrapper$PoolRedeemer",
);
export type RedeemerWrapper$PoolRedeemer = Exact<
  typeof RedeemerWrapper$PoolRedeemer
>;
export const RedeemerWrapper$SettingsRedeemer = Contracts.Import(
  "RedeemerWrapper$SettingsRedeemer",
);
export type RedeemerWrapper$SettingsRedeemer = Exact<
  typeof RedeemerWrapper$SettingsRedeemer
>;
export const Tuple$ByteArray_ByteArray = Contracts.Import(
  "Tuple$ByteArray_ByteArray",
);
export type Tuple$ByteArray_ByteArray = Exact<typeof Tuple$ByteArray_ByteArray>;
export const Tuple$ByteArray_ByteArray_Int = Contracts.Import(
  "Tuple$ByteArray_ByteArray_Int",
);
export type Tuple$ByteArray_ByteArray_Int = Exact<
  typeof Tuple$ByteArray_ByteArray_Int
>;
export const Tuple$Int_Int = Contracts.Import("Tuple$Int_Int");
export type Tuple$Int_Int = Exact<typeof Tuple$Int_Int>;
export const Tuple$Int_Option$SignedStrategyExecution_Int = Contracts.Import(
  "Tuple$Int_Option$SignedStrategyExecution_Int",
);
export type Tuple$Int_Option$SignedStrategyExecution_Int = Exact<
  typeof Tuple$Int_Option$SignedStrategyExecution_Int
>;
export const Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int =
  Contracts.Import(
    "Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int",
  );
export type Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int =
  Exact<
    typeof Tuple$Tuple$ByteArray_ByteArray_Int_Tuple$ByteArray_ByteArray_Int
  >;
export const Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray =
  Contracts.Import("Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray");
export type Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray = Exact<
  typeof Tuple$Tuple$ByteArray_ByteArray_Tuple$ByteArray_ByteArray
>;
export const MultisigScript = Contracts.Import("MultisigScript");
export type MultisigScript = Exact<typeof MultisigScript>;
export const OracleDatum = Contracts.Import("OracleDatum");
export type OracleDatum = Exact<typeof OracleDatum>;
export const OracleRedeemer = Contracts.Import("OracleRedeemer");
export type OracleRedeemer = Exact<typeof OracleRedeemer>;
export const Destination = Contracts.Import("Destination");
export type Destination = Exact<typeof Destination>;
export const Order = Contracts.Import("Order");
export type Order = Exact<typeof Order>;
export const OrderDatum = Contracts.Import("OrderDatum");
export type OrderDatum = Exact<typeof OrderDatum>;
export const OrderRedeemer = Contracts.Import("OrderRedeemer");
export type OrderRedeemer = Exact<typeof OrderRedeemer>;
export const SignedStrategyExecution = Contracts.Import(
  "SignedStrategyExecution",
);
export type SignedStrategyExecution = Exact<typeof SignedStrategyExecution>;
export const StrategyAuthorization = Contracts.Import("StrategyAuthorization");
export type StrategyAuthorization = Exact<typeof StrategyAuthorization>;
export const StrategyExecution = Contracts.Import("StrategyExecution");
export type StrategyExecution = Exact<typeof StrategyExecution>;
export const ManageRedeemer = Contracts.Import("ManageRedeemer");
export type ManageRedeemer = Exact<typeof ManageRedeemer>;
export const PoolDatum = Contracts.Import("PoolDatum");
export type PoolDatum = Exact<typeof PoolDatum>;
export const PoolMintRedeemer = Contracts.Import("PoolMintRedeemer");
export type PoolMintRedeemer = Exact<typeof PoolMintRedeemer>;
export const PoolRedeemer = Contracts.Import("PoolRedeemer");
export type PoolRedeemer = Exact<typeof PoolRedeemer>;
export const SettingsDatum = Contracts.Import("SettingsDatum");
export type SettingsDatum = Exact<typeof SettingsDatum>;
export const SettingsRedeemer = Contracts.Import("SettingsRedeemer");
export type SettingsRedeemer = Exact<typeof SettingsRedeemer>;
