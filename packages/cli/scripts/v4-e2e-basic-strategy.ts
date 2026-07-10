/**
 * E2E on preview: exercise getPoolByIdent, a basic (deposit) order, and a
 * strategy order against the pool created earlier. Each order is confirmed on
 * chain; unscooped orders are cancelled so nothing dangles.
 */
import { parse } from "@blaze-cardano/data";
import { AssetAmount } from "@sundaeswap/asset";
import { Blaze, Blockfrost, Core, HotWallet } from "@blaze-cardano/sdk";

import { ADA_METADATA } from "../../core/src/constants.js";
import { SundaeSDK } from "../../core/src/SundaeSDK.class.js";
import { EContractVersion } from "../../core/src/@types/index.js";
import { V4Types } from "../../core/src/DatumBuilders/ContractTypes/index.js";
import type { TxBuilderV4 } from "../../core/src/TxBuilders/TxBuilder.V4.class.js";

const SEED = process.env.SEED_PHRASE;
if (!SEED) throw new Error("set SEED_PHRASE to the preview wallet mnemonic");
const KEYS = process.env.BF_KEYS?.split(",") ?? [];
const POOL_TX =
  "752cb9f21a5cf2ac9db2a705164dbd5a56352b55da5500f33b90821adbfacc2d";
const TOKEN_A =
  "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e41";
const TOKEN_B =
  "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.744f4b454e42";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Placement: payment-key signature only (no order being spent). */
async function submitPlain(
  composed: Awaited<ReturnType<TxBuilderV4["swap"]>>,
  label: string,
): Promise<string> {
  const built = await composed.build();
  const signed = await built.sign();
  const txId = await signed.submit();
  console.log(`  [${label}] submitted ${txId}`);
  return txId;
}

/** Cancel/update: v4 order owners are stake-keyed, so sign with the stake key. */
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

async function waitFor(provider: Blockfrost, txId: string, label: string) {
  const ref = new Core.TransactionInput(Core.TransactionId(txId), 0n);
  for (let i = 0; i < 24; i++) {
    try {
      if ((await provider.resolveUnspentOutputs([ref])).length > 0) {
        console.log(`  [${label}] confirmed ${txId}#0`);
        return;
      }
    } catch {
      /* not yet */
    }
    await sleep(10_000);
  }
  throw new Error(`timed out waiting for ${label}`);
}

/** Returns true if the order UTxO was scooped (no longer exists) within ~60s. */
async function scoopedWithin(
  provider: Blockfrost,
  txId: string,
): Promise<boolean> {
  const ref = new Core.TransactionInput(Core.TransactionId(txId), 0n);
  for (let i = 0; i < 6; i++) {
    await sleep(10_000);
    if ((await provider.resolveUnspentOutputs([ref])).length === 0) return true;
  }
  return false;
}

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
  const sdk = SundaeSDK.new({ blazeInstance: blaze });
  const builder = sdk.builder(EContractVersion.V4) as TxBuilderV4;

  // ── getPoolByIdent ─────────────────────────────────────────────────
  const [poolUtxo] = await provider.resolveUnspentOutputs([
    new Core.TransactionInput(Core.TransactionId(POOL_TX), 0n),
  ]);
  const poolDatum = parse(
    V4Types.PoolDatum,
    poolUtxo.output().datum()!.asInlineData()!,
  );
  const ident = poolDatum.identifier;
  console.log(`\n[getPoolByIdent] pool ident ${ident}`);
  const pool = await builder.getPoolByIdent(ident);
  console.log(
    "  assets:",
    JSON.stringify(pool.assets, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );
  console.log("  totalLp:", pool.totalLp.toString(), "lp:", pool.lpAssetId);

  // ── basic deposit order ────────────────────────────────────────────
  let depTx = "(skipped)";
  let depScooped = false;
  if (!process.env.SKIP_DEPOSIT) {
    console.log("\n[deposit] placing a deposit order…");
    const deposit = await builder.deposit({
      ownerAddress: owner,
      offered: [
        new AssetAmount(1_000_000n, { assetId: TOKEN_A, decimals: 0 }),
        new AssetAmount(1_000_000n, { assetId: TOKEN_B, decimals: 0 }),
      ],
      minReceived: [
        new AssetAmount(1n, { assetId: pool.lpAssetId, decimals: 0 }),
      ],
    });
    depTx = await submitPlain(deposit, "deposit");
    await waitFor(provider, depTx, "deposit");
    depScooped = await scoopedWithin(provider, depTx);
    console.log(
      `  deposit ${depScooped ? "SCOOPED ✅" : "not scooped (will cancel)"}`,
    );
    if (!depScooped) {
      const c = await builder.cancel({ utxo: { hash: depTx, index: 0 } });
      const ctx = await submit(blaze, wallet, c, "cancel deposit");
      await waitFor(provider, ctx, "cancel deposit");
    }
  }

  // ── strategy order ─────────────────────────────────────────────────
  console.log("\n[strategy] placing a strategy order…");
  const strat = await builder.strategy({
    ownerAddress: owner,
    offered: [new AssetAmount(5_000_000n, ADA_METADATA)],
    authSigner: owner,
  });
  const stratTx = await submitPlain(strat, "strategy");
  await waitFor(provider, stratTx, "strategy");
  console.log("  strategy order placed (execution requires a strategist SSE)");
  const sc = await builder.cancel({ utxo: { hash: stratTx, index: 0 } });
  const sctx = await submit(blaze, wallet, sc, "cancel strategy");
  await waitFor(provider, sctx, "cancel strategy");

  console.log("\n✅ done");
  console.log(
    `  deposit:  ${depTx}${depScooped ? " (scooped)" : " (cancelled)"}`,
  );
  console.log(`  strategy: ${stratTx} (cancelled)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
