/**
 * Read-only: extract every PoolConfig settings entry on preview as a
 * settings-API record (label, txIn, datum cbor, values{poolValidator, token,
 * actions}). Emits JSON to stdout for the DynamoDB updater.
 */
import { parse } from "@blaze-cardano/data";
import { Blockfrost, Core } from "@blaze-cardano/sdk";
import { V4Types } from "../../core/src/DatumBuilders/ContractTypes/index.js";

const SETTINGS_HASH =
  "4fc157fe13a75c6a581767f7772996623970fc975dbde6a41c876a66";
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
  const records: unknown[] = [];

  for (const u of utxos) {
    const inline = u.output().datum()?.asInlineData();
    if (!inline) continue;
    let config;
    try {
      config = parse(V4Types.PoolConfig, inline);
    } catch {
      continue; // not a PoolConfig (root settings / order config)
    }
    // A PoolConfig has a 28-byte pool_validator + a non-empty actions list.
    if (!config.pool_validator || config.pool_validator.length !== 56) continue;

    const ma = u.output().amount().multiasset();
    let token = "";
    if (ma)
      for (const [assetId] of ma.entries()) {
        const id = assetId.toString();
        if (id.length > 56) token = id.slice(56); // asset name
      }

    records.push({
      label: "pool",
      txIn: {
        hash: u.input().transactionId().toString(),
        index: Number(u.input().index()),
      },
      datum: inline.toCbor(),
      values: {
        poolValidator: config.pool_validator,
        token,
        actions: config.actions.map((a) => ({
          tag: Number(a.tag),
          enabled: a.enabled,
          modules: a.modules,
        })),
      },
    });
  }

  console.log(JSON.stringify(records, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
