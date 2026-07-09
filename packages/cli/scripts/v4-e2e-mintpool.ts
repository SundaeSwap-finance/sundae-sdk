/**
 * End-to-end test of TxBuilderV4.mintPool() against live preview: create a
 * constant-sum pool from two test tokens, confirm the pool UTxO on-chain.
 */
import { AssetAmount } from "@sundaeswap/asset";
import { Blaze, Blockfrost, Core, HotWallet } from "@blaze-cardano/sdk";

import { SundaeSDK } from "../../core/src/SundaeSDK.class.js";
import { EContractVersion } from "../../core/src/@types/index.js";
import type { TxBuilderV4 } from "../../core/src/TxBuilders/TxBuilder.V4.class.js";

const SEED = process.env.SEED_PHRASE;
if (!SEED) throw new Error("set SEED_PHRASE to the preview wallet mnemonic");
const KEYS = process.env.BF_KEYS?.split(",") ?? [];

// Two equal-valued test tokens the wallet holds (TOKENA / TOKENB).
const TOKEN_A = `09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e41`;
const TOKEN_B = `09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e42`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const entropy = Core.mnemonicToEntropy(SEED, Core.wordlist);
  const bip32 = Core.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(entropy, "hex"),
    "",
  );
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
  if (!provider) throw new Error("no working preview key");

  const wallet = await HotWallet.fromMasterkey(
    Core.Bip32PrivateKeyHex(bip32.hex()),
    provider,
  );
  const blaze = await Blaze.from(provider, wallet);
  const owner = wallet.address.toBech32();
  console.log("owner:", owner);

  const sdk = SundaeSDK.new({ blazeInstance: blaze });
  const builder = sdk.builder(EContractVersion.V4) as TxBuilderV4;

  console.log("\nbuilding mintPool (constant-sum, TOKENA/TOKENB)…");
  const composed = await builder.mintPool({
    assets: [
      new AssetAmount(10_000_000n, { assetId: TOKEN_A, decimals: 0 }),
      new AssetAmount(10_000_000n, { assetId: TOKEN_B, decimals: 0 }),
    ],
    curve: { kind: "constantSum", fee: { num: 5n, den: 1000n } },
    ownerAddress: owner,
  });
  console.log("pool datum:", (composed.datum as string).slice(0, 80), "…");

  const { builtTx } = await composed.build();
  const signed = await wallet.signTransaction(builtTx, true);
  const ws = builtTx.witnessSet();
  const existing = ws.vkeys()?.toCore() ?? [];
  const fresh = signed.vkeys()?.toCore() ?? [];
  ws.setVkeys(
    Core.CborSet.fromCore([...fresh, ...existing], Core.VkeyWitness.fromCore),
  );
  builtTx.setWitnessSet(ws);
  const txId = await blaze.provider.postTransactionToChain(builtTx);
  console.log("submitted create-pool tx:", txId);

  // Confirm the pool UTxO lands (output 0 = the pool).
  const ref = new Core.TransactionInput(Core.TransactionId(txId), 0n);
  for (let i = 0; i < 30; i++) {
    try {
      const outs = await provider.resolveUnspentOutputs([ref]);
      if (outs.length > 0) {
        console.log(`\n✅ pool created + confirmed: ${txId}#0`);
        return;
      }
    } catch {
      /* not yet */
    }
    await sleep(10_000);
  }
  throw new Error("timed out waiting for pool UTxO");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
