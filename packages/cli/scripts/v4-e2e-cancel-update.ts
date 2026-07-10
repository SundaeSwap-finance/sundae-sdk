/**
 * End-to-end test of TxBuilderV4.cancel() and update() against live preview.
 *
 * Flow (each step confirmed on-chain before the next):
 *   1. place swap order A  — with an absurd minReceived so the scooper filters
 *      it as unfillable and it sits untouched
 *   2. update A -> B       — spends A, locks a fresh order B in one tx
 *   3. cancel B            — reclaims B's assets, leaving nothing dangling
 *
 * Credentials: SEED_PHRASE (preview wallet mnemonic) + BF_KEYS (comma-separated
 * preview Blockfrost project ids, the first that authenticates wins).
 */
import { AssetAmount } from "@sundaeswap/asset";
import { Blaze, Blockfrost, Core, HotWallet } from "@blaze-cardano/sdk";

import { ADA_METADATA } from "../../core/src/constants.js";
import { SundaeSDK } from "../../core/src/SundaeSDK.class.js";
import { EContractVersion } from "../../core/src/@types/index.js";
import type { TxBuilderV4 } from "../../core/src/TxBuilders/TxBuilder.V4.class.js";

const SEED = process.env.SEED_PHRASE;
if (!SEED) throw new Error("set SEED_PHRASE to the preview wallet mnemonic");
const KEY_CANDIDATES = process.env.BF_KEYS?.split(",") ?? [];

// TOKENA — used only as an unreachable ask asset so orders never fill.
const TOKENA_ID =
  "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e41";
const ABSURD = 1_000_000_000_000_000_000n; // 1e18 TOKENA — never fillable

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function makeProvider(key: string) {
  const provider = new Blockfrost({
    network: "cardano-preview",
    projectId: key,
  });
  await provider.getParameters();
  return provider;
}

/** Poll until the given tx output ref resolves on-chain (or time out). */
async function waitForOutput(
  provider: Blockfrost,
  txId: string,
  index: number,
  label: string,
) {
  const ref = new Core.TransactionInput(
    Core.TransactionId(txId),
    BigInt(index),
  );
  for (let i = 0; i < 30; i++) {
    try {
      const outs = await provider.resolveUnspentOutputs([ref]);
      if (outs.length > 0) {
        console.log(`  [${label}] confirmed ${txId}#${index}`);
        return;
      }
    } catch {
      /* not yet visible */
    }
    await sleep(10_000);
  }
  throw new Error(`Timed out waiting for ${label} output ${txId}#${index}`);
}

/**
 * Sign + submit, replicating `Blaze.signTransaction` but with the stake key —
 * v4 order owners are keyed on the stake hash, so cancel/update require the
 * stake-key witness. (A CIP-30 browser wallet supplies this automatically; the
 * headless HotWallet needs the flag.)
 */
async function submit(
  blaze: Blaze<Blockfrost, HotWallet>,
  wallet: HotWallet,
  composed: Awaited<ReturnType<TxBuilderV4["swap"]>>,
  label: string,
): Promise<string> {
  const { builtTx } = await composed.build();
  const signed = await wallet.signTransaction(builtTx, true, true);
  const ws = builtTx.witnessSet();
  const existing = ws.vkeys()?.toCore() ?? [];
  const fresh = signed.vkeys()?.toCore() ?? [];
  ws.setVkeys(
    Core.CborSet.fromCore([...fresh, ...existing], Core.VkeyWitness.fromCore),
  );
  builtTx.setWitnessSet(ws);
  const txId = await blaze.provider.postTransactionToChain(builtTx);
  console.log(`  [${label}] submitted ${txId}`);
  return txId;
}

async function main() {
  const entropy = Core.mnemonicToEntropy(SEED, Core.wordlist);
  const bip32 = Core.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(entropy, "hex"),
    "",
  );

  let provider: Blockfrost | undefined;
  for (const key of KEY_CANDIDATES) {
    try {
      provider = await makeProvider(key);
      break;
    } catch (e) {
      console.log(`key failed: ${(e as Error).message}`);
    }
  }
  if (!provider) throw new Error("No working preview Blockfrost key");

  const wallet = await HotWallet.fromMasterkey(
    Core.Bip32PrivateKeyHex(bip32.hex()),
    provider,
  );
  const blaze = await Blaze.from(provider, wallet);
  const owner = wallet.address.toBech32();
  console.log("owner:", owner);

  const sdk = SundaeSDK.new({ blazeInstance: blaze });
  const builder = sdk.builder(EContractVersion.V4) as TxBuilderV4;

  const offered = () => new AssetAmount(5_000_000n, ADA_METADATA);
  const ask = () =>
    new AssetAmount(ABSURD, { assetId: TOKENA_ID, decimals: 0 });

  // Cancel-only mode: skip place/update, just cancel the given order UTxO.
  if (process.env.CANCEL_ONLY) {
    const target = process.env.CANCEL_ONLY;
    console.log(`\n[cancel-only] cancelling ${target}#0…`);
    const cancelTx = await builder.cancel({ utxo: { hash: target, index: 0 } });
    const txC = await submit(blaze, wallet, cancelTx, "cancel");
    await waitForOutput(provider, txC, 0, "cancel payout");
    console.log(`\n✅ done\n  cancel: ${txC}`);
    return;
  }

  // ── 1. place order A (or resume from an existing one) ───────────────
  let txA: string;
  if (process.env.RESUME_ORDER) {
    txA = process.env.RESUME_ORDER;
    console.log(`\n[1] resuming from existing order A ${txA}#0`);
  } else {
    console.log("\n[1] placing swap order A (unfillable)…");
    const placeA = await builder.swap({
      ownerAddress: owner,
      offered: offered(),
      minReceived: ask(),
    });
    txA = await submit(blaze, wallet, placeA, "place A");
    await waitForOutput(provider, txA, 0, "order A");
  }

  // ── 2. update A -> B ────────────────────────────────────────────────
  console.log("\n[2] updating A -> B…");
  const updateTx = await builder.update({
    cancelUtxo: { hash: txA, index: 0 },
    order: {
      kind: "swap",
      ownerAddress: owner,
      offered: offered(),
      minReceived: ask(),
    },
  });
  const txB = await submit(blaze, wallet, updateTx, "update");
  await waitForOutput(provider, txB, 0, "order B");

  // ── 3. cancel B ─────────────────────────────────────────────────────
  console.log("\n[3] cancelling B…");
  const cancelTx = await builder.cancel({ utxo: { hash: txB, index: 0 } });
  const txC = await submit(blaze, wallet, cancelTx, "cancel");
  // cancel's payout goes to the wallet; poll the wallet for the cancel tx.
  await waitForOutput(provider, txC, 0, "cancel payout");

  console.log("\n✅ done");
  console.log(`  place A:  ${txA}`);
  console.log(`  update B: ${txB}`);
  console.log(`  cancel:   ${txC}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
