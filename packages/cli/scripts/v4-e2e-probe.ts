/**
 * Read-only probe: derive the preview wallet from the seed, pick a working
 * Blockfrost preview key, and print the address + balance. No tx submitted.
 */
import { Blaze, Blockfrost, Core, HotWallet } from "@blaze-cardano/sdk";

const SEED = process.env.SEED_PHRASE;
if (!SEED) throw new Error("set SEED_PHRASE to the preview wallet mnemonic");

const KEY_CANDIDATES = process.env.BF_KEYS?.split(",") ?? [];

async function makeProvider(key: string) {
  const provider = new Blockfrost({
    network: "cardano-preview",
    projectId: key,
  });
  // sanity: hit the provider once
  await provider.getParameters();
  return provider;
}

async function main() {
  const entropy = Core.mnemonicToEntropy(SEED, Core.wordlist);
  const bip32 = Core.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(entropy, "hex"),
    "",
  );

  let provider: Blockfrost | undefined;
  let usedKeyIdx = -1;
  for (let i = 0; i < KEY_CANDIDATES.length; i++) {
    try {
      provider = await makeProvider(KEY_CANDIDATES[i]!);
      usedKeyIdx = i;
      break;
    } catch (e) {
      console.log(`key[${i}] failed: ${(e as Error).message}`);
    }
  }
  if (!provider) throw new Error("No working preview Blockfrost key");
  console.log(`Using key index ${usedKeyIdx}`);

  const wallet = await HotWallet.fromMasterkey(
    Core.Bip32PrivateKeyHex(bip32.hex()),
    provider,
  );
  const blaze = await Blaze.from(provider, wallet);

  const address = wallet.address.toBech32();
  console.log("address:", address);

  const utxos = await blaze.provider.getUnspentOutputs(wallet.address);
  console.log("utxo count:", utxos.length);

  let lovelace = 0n;
  const assets: Record<string, bigint> = {};
  for (const u of utxos) {
    const v = u.output().amount();
    lovelace += v.coin();
    const ma = v.multiasset();
    if (ma) {
      for (const [assetId, amt] of ma.entries()) {
        assets[assetId.toString()] = (assets[assetId.toString()] ?? 0n) + amt;
      }
    }
  }
  console.log("lovelace:", lovelace.toString());
  console.log("assets:");
  for (const [id, amt] of Object.entries(assets)) {
    console.log(`  ${id}  ${amt.toString()}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
