import type { Constr } from "lucid-cardano";

// prettier-ignore
export type TLucidDatum = Constr<
  | string
  | Constr<Constr<Constr<Constr<string>
  | Constr<Constr<Constr<string>>>>>>
  | Constr<string | Constr<bigint>>
>;
