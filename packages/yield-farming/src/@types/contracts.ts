import { Data } from "lucid-cardano";

export const DelegationOwnerSchema = Data.Object({
  address: Data.Bytes(),
});
export type TDelegationOwner = Data.Static<typeof DelegationOwnerSchema>;
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
export type TDelegationPrograms = Data.Static<typeof DelegationProgramsSchema>;
export const DelegationPrograms =
  DelegationOwnerSchema as unknown as TDelegationPrograms;

export const DelegationSchema = Data.Object({
  owner: DelegationOwnerSchema,
  programs: DelegationProgramsSchema,
});
export type TDelegation = Data.Static<typeof DelegationSchema>;
export const Delegation = DelegationSchema as unknown as TDelegation;
