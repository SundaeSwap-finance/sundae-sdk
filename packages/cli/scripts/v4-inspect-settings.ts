/** Read-only: dump the preview v4 settings UTxOs, flagging PoolConfig entries. */
import { Blockfrost, Core } from "@blaze-cardano/sdk";

const SETTINGS_HASH =
  "4fc157fe13a75c6a581767f7772996623970fc975dbde6a41c876a66";
const KEYS = process.env.BF_KEYS?.split(",") ?? [];

function walk(pd: Core.PlutusData, depth = 0): string {
  const c = pd.asConstrPlutusData();
  if (c) {
    const fields = c.getData();
    const parts: string[] = [];
    for (let i = 0; i < fields.getLength(); i++)
      parts.push(walk(fields.get(i), depth + 1));
    return `Constr${c.getAlternative()}[${parts.join(",")}]`;
  }
  const b = pd.asBoundedBytes();
  if (b) return `0x${Buffer.from(b).toString("hex").slice(0, 24)}`;
  const i = pd.asInteger();
  if (i !== undefined) return i.toString();
  const l = pd.asList();
  if (l) {
    const parts: string[] = [];
    for (let k = 0; k < l.getLength(); k++)
      parts.push(walk(l.get(k), depth + 1));
    return `[${parts.join(",")}]`;
  }
  return "?";
}

async function main() {
  let provider: Blockfrost | undefined;
  for (const key of KEYS) {
    try {
      const p = new Blockfrost({ network: "cardano-preview", projectId: key });
      await p.getParameters();
      provider = p;
      break;
    } catch {
      /* next */
    }
  }
  if (!provider) throw new Error("no working key");

  const addr = Core.addressFromCredential(
    Core.NetworkId.Testnet,
    Core.Credential.fromCore({
      hash: Core.Hash28ByteBase16(SETTINGS_HASH),
      type: Core.CredentialType.ScriptHash,
    }),
  );
  const utxos = await provider.getUnspentOutputs(addr);
  console.log(`settings utxos: ${utxos.length}`);
  for (const u of utxos) {
    const ma = u.output().amount().multiasset();
    const names: string[] = [];
    if (ma)
      for (const [assetId] of ma.entries()) {
        const id = assetId.toString();
        names.push(id.slice(56)); // asset name after 28-byte policy
      }
    const inline = u.output().datum()?.asInlineData();
    const txIn = `${u.input().transactionId()}#${u.input().index()}`;
    console.log(`\n── token names: ${names.join(", ") || "(none)"}`);
    console.log(`  txIn: ${txIn}`);
    if (inline) console.log("  datum:", walk(inline).slice(0, 500));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
