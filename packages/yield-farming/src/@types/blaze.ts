import { Data, Static } from "@blaze-cardano/sdk";

export const DelegationOwnerSchema = Data.Object({
  address: Data.Bytes(),
});
export type TDelegationOwner = Static<typeof DelegationOwnerSchema>;
export const DelegationOwner =
  DelegationOwnerSchema as unknown as TDelegationOwner;

export const DelegationProgramsSchema = Data.Array(
  Data.Enum([
    Data.Literal("None"),
    Data.Object({
      Delegation: Data.Tuple([Data.Bytes(), Data.Bytes(), Data.Integer()]),
    }),
  ])
);
export type TDelegationPrograms = Static<typeof DelegationProgramsSchema>;
export const DelegationPrograms =
  DelegationOwnerSchema as unknown as TDelegationPrograms;

export const DelegationSchema = Data.Object({
  owner: DelegationOwnerSchema,
  programs: DelegationProgramsSchema,
});
export type TDelegation = Static<typeof DelegationSchema>;
export const Delegation = DelegationSchema as unknown as TDelegation;

export const PositionRedeemerSchema = Data.Literal("EMPTY");
export type TPositionRedeemer = Static<typeof PositionRedeemerSchema>;
export const PositionRedeemer =
  PositionRedeemerSchema as unknown as TPositionRedeemer;
