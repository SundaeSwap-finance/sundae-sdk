import { Data } from "lucid-cardano";

export const DelegationOwnerSchema = Data.Object({
  address: Data.Bytes(),
});
export type TDelegationOwner = Data.Static<typeof DelegationOwnerSchema>;
export const DelegationOwner =
  DelegationOwnerSchema as unknown as TDelegationOwner;

export const DelegationArraySchema = Data.Object({
  Delegation: Data.Tuple([Data.Bytes(), Data.Bytes(), Data.Integer()]),
});
export type TDelegationArray = Data.Static<typeof DelegationArraySchema>;
export const DelegationArray =
  DelegationArraySchema as unknown as TDelegationArray;

export const DelegationProgramsSchema = Data.Array(
  Data.Enum([Data.Literal("None"), DelegationArraySchema])
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
