/* eslint-disable no-console */
import { Core, makeValue } from "@blaze-cardano/sdk";
import { input } from "@inquirer/prompts";
import type { IMenu } from "@sundaeswap/sprinkles";
import type { IAppContext } from "../types.js";
import type { CliSettingsSchema } from "../schema.js";
import {
  addLiquidityMenu,
  cancelSwapMenu,
  mintPoolMenu,
  removeLiquidityMenu,
  swapMenu,
  updateProtocolFeesMenu,
  updatePoolFeesMenu,
} from "./pool.js";
import { getAssetAmount, printHeader } from "./shared.js";
import { strategyMenu } from "./strategy.js";
import {
  bootstrapSettingsUtxoMenu,
  updateSettingsUtxoMenu,
  manageCustomValidatorsMenu,
} from "./validators.js";
import { Hash28ByteBase16 } from "@cardano-sdk/crypto";

export function mainMenu(ctx: IAppContext): IMenu<typeof CliSettingsSchema> {
  return {
    title: "SundaeSwap CLI",
    beforeShow: async (_sprinkle) => {
      await printHeader(ctx);
    },
    items: [
      {
        title: "SundaeSwap",
        items: [
          {
            title: "Mint Pool",
            action: async () => {
              await mintPoolMenu(ctx);
            },
          },
          {
            title: "Swap",
            action: async () => {
              await swapMenu(ctx);
            },
          },
          {
            title: "Strategy",
            action: async () => {
              await strategyMenu(ctx);
            },
          },
          {
            title: "Add Liquidity",
            action: async () => {
              await addLiquidityMenu(ctx);
            },
          },
          {
            title: "Remove Liquidity",
            action: async () => {
              await removeLiquidityMenu(ctx);
            },
          },
          {
            title: "Cancel Swap",
            action: async () => {
              await cancelSwapMenu(ctx);
            },
          },
          {
            title: "Update Protocol Fees (Stableswaps)",
            action: async () => {
              await updateProtocolFeesMenu(ctx);
            },
          },
          {
            title: "Update Pool Fees",
            action: async () => {
              await updatePoolFeesMenu(ctx);
            },
          },
        ],
      },
      {
        title: "Validators",
        items: [
          {
            title: "Bootstrap Settings UTxO",
            action: async () => {
              await bootstrapSettingsUtxoMenu(ctx);
            },
          },
          {
            title: "Update Settings UTxO",
            action: async () => {
              await updateSettingsUtxoMenu(ctx);
            },
          },
          {
            title: "Manage Custom Validators",
            action: async () => {
              await manageCustomValidatorsMenu(ctx);
            },
          },
        ],
      },
      {
        title: "Utilities",
        items: [
          {
            title: "Mint Token",
            action: async () => {
              await mintToken(ctx);
            },
          },
          {
            title: "Simple Send",
            action: async () => {
              await simpleSend(ctx);
            },
          },
          {
            title: "Register Stake Key",
            action: async () => {
              await registerStakeKey(ctx);
            },
          },
          {
            title: "Sign Transaction from CBOR",
            action: async () => {
              await signTransactionFromCbor(ctx);
            },
          },
        ],
      },
    ],
  };
}

async function mintToken(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Mint Token ====\n");
  const tokenName = await input({
    message: "Enter token name",
  });
  const tokenAmount = await input({
    message: "Enter token amount",
  });
  const address = ctx.sprinkle.settings.wallet.address;
  if (!address) {
    console.log("Could not determine wallet address.");
    return;
  }
  const hash = Core.Ed25519KeyHashHex(
    Core.Address.fromBech32(address)
      .asBase()!
      .getPaymentCredential()!
      .hash!.toString(),
  );
  const tokenPolicy = new Core.ScriptPubkey(hash);
  const policy = Core.Script.newNativeScript(
    Core.NativeScript.newScriptPubkey(tokenPolicy),
  );
  console.log(
    `Token policy: ${policy.hash()}\nToken name: ${tokenName}\nToken amount: ${tokenAmount}`,
  );
  const mints = new Map<Core.AssetName, bigint>();
  mints.set(
    Core.AssetName(Core.toHex(Buffer.from(tokenName))),
    BigInt(tokenAmount),
  );

  const sdk = await ctx.sdk();
  const partialTx = await sdk
    .blaze()
    .newTransaction()
    .addMint(Core.PolicyId(policy.hash()), mints)
    .provideScript(policy);
  const tx = await partialTx.complete();
  console.log("Completed transaction");
  await ctx.sprinkle.TxDialog(sdk.blaze(), tx);
}

async function simpleSend(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Simple Send ====\n");
  const recipient = await input({
    message: "Enter recipient address",
  });
  const amount = await getAssetAmount(
    ctx,
    "Which asset do you want to send?",
    0n,
  );
  if (!amount) {
    console.log("No asset selected, returning to main menu.");
    return;
  }
  let value;
  if (amount.id === "ada.lovelace") {
    value = makeValue(amount.amount);
  } else {
    value = makeValue(0n, [amount.id, amount.amount]);
  }
  const sdk = await ctx.sdk();
  const tx = await sdk
    .blaze()
    .newTransaction()
    .payAssets(Core.Address.fromBech32(recipient), value)
    .complete();
  await ctx.sprinkle.TxDialog(sdk.blaze(), tx);
}

async function registerStakeKey(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Register Stake Key ====\n");
  const stakeHash = await input({
    message: "Enter stake key hash (in hex)",
  });
  const sdk = await ctx.sdk();
  const tx = await sdk
    .blaze()
    .newTransaction()
    .addRegisterStake(
      Core.Credential.fromCore({
        hash: Hash28ByteBase16(stakeHash),
        type: Core.CredentialType.ScriptHash,
      }),
    )
    .complete();
  await ctx.sprinkle.TxDialog(sdk.blaze(), tx);
}

async function signTransactionFromCbor(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Sign Transaction from CBOR ====\n");
  console.log("Paste the transaction CBOR hex string:\n");

  const cborHex = await input({
    message: "Transaction CBOR (hex):",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "CBOR cannot be empty";
      }
      if (!/^[0-9a-fA-F]+$/.test(value.trim())) {
        return "CBOR must be a valid hexadecimal string";
      }
      return true;
    },
  });

  const sdk = await ctx.sdk();
  const tx = Core.Transaction.fromCbor(Core.TxCBOR(cborHex.trim()));
  await ctx.sprinkle.TxDialog(sdk.blaze(), tx);
}
