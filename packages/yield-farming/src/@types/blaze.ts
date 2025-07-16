import { Exact, Type } from "@blaze-cardano/data";

const Types = Type.Module({
  DelegationOwner: Type.Object(
    {
      address: Type.String(),
    },
    {
      ctor: 0n,
    },
  ),
  DelegationPrograms: Type.Array(
    Type.Union([
      Type.Literal("None", { ctor: 0n }),
      Type.Object(
        {
          Delegation: Type.Tuple(
            [Type.String(), Type.String(), Type.BigInt()],
            { ctor: 1n },
          ),
        },
        { ctor: 1n },
      ),
    ]),
  ),
  Delegation: Type.Object(
    {
      owner: Type.Ref("DelegationOwner"),
      programs: Type.Ref("DelegationPrograms"),
    },
    {
      ctor: 0n,
    },
  ),
  PositionRedeemer: Type.Literal("EMPTY", { ctor: 0n }),
});

export const DelegationOwner = Types.Import("DelegationOwner");
export type TDelegationOwner = Exact<typeof DelegationOwner>;
export const DelegationPrograms = Types.Import("DelegationPrograms");
export type TDelegationPrograms = Exact<typeof DelegationPrograms>;
export const Delegation = Types.Import("Delegation");
export type TDelegation = Exact<typeof Delegation>;
export const PositionRedeemer = Types.Import("PositionRedeemer");
export type TPositionRedeemer = Exact<typeof PositionRedeemer>;
