/**
 * Read-only: fetch an existing pool's create tx and decode the per-module
 * `Create` withdrawal redeemers (Constr0[config]) — recovering the exact
 * module configs (fee-split protocol_share, governance admin/delay, …) that
 * live preview pools were created with.
 */
import { Core } from "@blaze-cardano/sdk";

const CREATE_TX = process.env.CREATE_TX!;
const KEY = process.env.BF_KEYS?.split(",")[0] ?? "";
const BF = "https://cardano-preview.blockfrost.io/api/v0";

function walk(pd: Core.PlutusData, depth = 0): string {
  const c = pd.asConstrPlutusData();
  if (c) {
    const f = c.getData();
    const parts: string[] = [];
    for (let i = 0; i < f.getLength(); i++)
      parts.push(walk(f.get(i), depth + 1));
    return `Constr${c.getAlternative()}[${parts.join(", ")}]`;
  }
  const b = pd.asBoundedBytes();
  if (b) return `0x${Buffer.from(b).toString("hex")}`;
  const i = pd.asInteger();
  if (i !== undefined && i !== null) return i.toString();
  const l = pd.asList();
  if (l) {
    const parts: string[] = [];
    for (let k = 0; k < l.getLength(); k++)
      parts.push(walk(l.get(k), depth + 1));
    return `[${parts.join(", ")}]`;
  }
  const m = pd.asMap();
  if (m) return "map{…}";
  return "?";
}

async function main() {
  const res = await fetch(`${BF}/txs/${CREATE_TX}/cbor`, {
    headers: { project_id: KEY },
  });
  const { cbor } = (await res.json()) as { cbor: string };
  const tx = Core.Transaction.fromCbor(Core.TxCBOR(cbor));

  const body = tx.body();
  const withdrawals = body.withdrawals();
  const wKeys = withdrawals ? [...withdrawals.keys()] : [];
  console.log(`withdrawals (${wKeys.length}):`);
  wKeys.forEach((ra, i) => {
    // reward account → script hash (drop network + type nibble → 28-byte hash)
    const acct = ra.toString();
    console.log(`  [${i}] ${acct}`);
  });

  // Map withdrawal index -> module script hash (from the reward account).
  const wHash: Record<number, string> = {};
  wKeys.forEach((ra, i) => {
    const addr = Core.Address.fromBech32(ra.toString());
    const cred = addr.asReward()?.getPaymentCredential();
    if (cred) wHash[i] = cred.hash.toString();
  });

  const ws = tx.witnessSet();
  const redeemers = ws.redeemers();
  if (!redeemers) {
    console.log("no redeemers");
    return;
  }
  console.log("\nmodule Create configs (moduleHash -> config cbor):");
  const out: Record<string, { configCbor: string | null; decoded: string }> =
    {};
  for (const r of redeemers.values()) {
    if (Number(r.tag()) !== 3) continue; // withdrawals only
    const idx = Number(r.index());
    const hash = wHash[idx];
    if (!hash) continue;
    // Create = Constr0[config]; extract the inner config (field 0), if any.
    const c = r.data().asConstrPlutusData();
    const fields = c?.getData();
    const config = fields && fields.getLength() > 0 ? fields.get(0) : null;
    out[hash] = {
      configCbor: config ? config.toCbor() : null,
      decoded: config ? walk(config) : "(nullary)",
    };
    console.log(`  ${hash}`);
    console.log(`     config: ${out[hash].decoded}`);
    console.log(`     cbor:   ${out[hash].configCbor}`);
  }
  console.log("\nJSON:", JSON.stringify(out));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
