import { Assets } from "lucid-cardano";

export interface IGummiWormUtxos {
  [key: string]: {
    address: string;
    datum: string | null;
    datumHash: string | null;
    inline_datum: string | null;
    reference_script: string | null;
    value: Assets;
  };
}
