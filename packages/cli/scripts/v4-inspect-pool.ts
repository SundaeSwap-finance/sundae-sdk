/** Read-only: decode a real preview v4 pool UTxO (datum + value). */
import { parse } from "@blaze-cardano/data";
import { Blockfrost, Core } from "@blaze-cardano/sdk";
import { V4Types } from "../../core/src/DatumBuilders/ContractTypes/index.js";

const POOL_HASH = "214a9841042bcbfd10d1cd7cbeaba46a68df644dee665f581ec0cf02";
const POOL_MINT = "975459b453bcf0d5dc72c837cc39e6473d98d7138733dab5269021d8";
const KEYS = process.env.BF_KEYS?.split(",") ?? [];

async function main() {
  let provider: Blockfrost | undefined;
  for (const key of KEYS) {
    try {
      const p = new Blockfrost({ network: "cardano-preview", projectId: key });
      await p.getParameters();
      provider = p;
      break;
    } catch {
      /* try next */
    }
  }
  if (!provider) throw new Error("no working key");

  const addr = Core.addressFromCredential(
    Core.NetworkId.Testnet,
    Core.Credential.fromCore({
      hash: Core.Hash28ByteBase16(POOL_HASH),
      type: Core.CredentialType.ScriptHash,
    }),
  );
  const utxos = await provider.getUnspentOutputs(addr);
  console.log(`pool address utxos: ${utxos.length}`);

  let shown = 0;
  for (const u of utxos) {
    if (shown >= 3) break;
    const val = u.output().amount();
    const ma = val.multiasset();
    // find the 222 NFT (000de140 prefix) under the pool-mint policy
    let has222 = false;
    const tokensUnderPolicy: [string, bigint][] = [];
    if (ma) {
      for (const [assetId, amt] of ma.entries()) {
        const id = assetId.toString();
        if (id.startsWith(POOL_MINT)) {
          const name = id.slice(POOL_MINT.length);
          tokensUnderPolicy.push([name, amt]);
          if (name.startsWith("000de140")) has222 = true;
        }
      }
    }
    if (!has222) continue;
    shown++;

    const inline = u.output().datum()?.asInlineData();
    if (!inline) {
      console.log("  (no inline datum)");
      continue;
    }
    const d = parse(V4Types.PoolDatum, inline);
    console.log("\n── pool ──");
    console.log("  identifier:  ", d.identifier);
    console.log("  total_lp:    ", d.total_lp.toString());
    console.log("  circulating: ", d.circulating_lp.toString());
    console.log("  preminted:   ", d.preminted_lp.toString());
    console.log(
      "  assets:      ",
      JSON.stringify(d.assets, (_k, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );
    console.log(
      "  actions:     ",
      JSON.stringify(d.actions, (_k, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );
    console.log("  module_state:", JSON.stringify(d.module_state));
    console.log("  lovelace:    ", val.coin().toString());
    console.log("  pool-mint tokens in UTxO:");
    for (const [name, amt] of tokensUnderPolicy) {
      const kind = name.startsWith("000de140")
        ? "(222 NFT)"
        : name.startsWith("000643b0")
          ? "(100 ref)"
          : name.startsWith("0014df10")
            ? "(333 LP)"
            : "(?)";
      console.log(`     ${kind} ${name.slice(0, 12)}… ${amt.toString()}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
