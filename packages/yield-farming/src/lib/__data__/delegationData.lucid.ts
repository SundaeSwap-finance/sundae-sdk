import { TDelegationPrograms } from "../../@types/lucid.js";

const delegation: TDelegationPrograms = [
  { Delegation: [Buffer.from("tINDY").toString("hex"), "00", 100n] },
  { Delegation: [Buffer.from("INDY").toString("hex"), "04", 55n] },
  { Delegation: [Buffer.from("INDY").toString("hex"), "02", 45n] },
  { Delegation: [Buffer.from("SBERRY").toString("hex"), "02", 100n] },
];

export { delegation };
