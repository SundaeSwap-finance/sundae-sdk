---
title: Core
nav_order: 1
has_children: true
parent: Guides
---

# Building a Swap

To get started building your first swap, you'll need to install a few things. Assuming you've setup a TypeScript and Webpack bundling config (see [details on requirements](/sundae-sdk/#requirements)), you can then install dependencies. We install the main `@sundaeswap/core` package, and then the latest version of `@blaze-cardano/sdk` (we're using [Bun.sh](https://bun.sh/) here, but you can use whatever package manager you like):

```bash
$ bun add @sundaeswap/core @blaze-cardano/sdk
```

## Steps

Building a swap consists of a few steps:

1. Querying Pool Information
2. Configuring your Swap Arguments
3. Requesting a Signature &amp; Submitting

Let's take each step and break it down so we can understand what's going on behind the scenes.

## 1. Querying Pool Information

For our example, we'll be using the Preview network, and a pool ident for ADA/RBERRY. If you're testing this locally, make sure you have Eternl installed and are on the `preview` network and have at least 30 tADA in your wallet.

{: .note }

> Keep in mind that async/await should usually be handled inside a function unless you
> have top-level await enabled in your bundler. For our purposes, they will not be in
> functions for clarity.

```ts
import { Blaze, Blockfrost, WebWallet } from "@blaze-cardano/sdk";
import { ETxBuilderType, ISundaeSDKOptions, SundaeSDK } from "@sundaeswap/core";

// Get the API from the browser window.
const myBlockfrostApiKey = "";
const api = await window.cardano.eternl.enable();
const blazeInstance = await Blaze.from(
  new Blockfrost({
    network: network ? "cardano-mainnet" : "cardano-preview",
    projectId: myBlockfrostApiKey
  }),
  new WebWallet(api),
);

const options: ISundaeSDKOptions = {
  blazeInstance,
};

const SDK = await new SundaeSDK(options);

const poolData = await SDK.query().findPoolData({
  ident: "34c2b9d553d3a74b3ac67cc8cefb423af0f77fc84664420090e09990",
});
```

- The first thing we do is setup a Lucid instance. This is because our `options.builder` config is set to use the `ETxBuilderType.LUCID` type.
- Next, we construct our SDK options config. We define that we'll be using the Eternl wallet (defined as `eternl` to match the property on the `window.cardano` object), and set the network to `preview`.
- Then, we instantiate a new `SundaeSDK` instance. It is recommended to keep this instance as a singleton across your app, so that it's not recreated every time.
- Finally, we query the `SDK.query()` method to get our default `QueryProvider`, which includes a convenience method for fetching pool data directly from the SundaeSwap API.

## 2. Configuring Your Swap Arguments

Before moving on, let's add a couple new imports to our file:

```ts
import { AssetAmount } from "@sundaeswap/asset";
import {
  // ...the previous imports
  ESwapType,
  EDatumType,
  ISwapConfigArgs,
} from "@sundaeswap/core";
```

- The `AssetAmount` class is a tool for dealing with asset calculations with regard to their respective decimal places and metadata.
- The `ESwapType`, `ISwapConfigArgs`, and `EDatumType` will be used inside our configuration object.

Next, let's build our swap configuration object:

```ts
// ...rest of our previous code

const args: ISwapConfigArgs = {
  swapType: {
    type: ESwapType.MARKET,
    slippage: 0.03,
  },
  pool: poolData,
  orderAddresses: {
    DestinationAddress: {
      address: "...your address",
      datum: {
        type: EDatumType.NONE,
      },
    },
  },
  suppliedAsset: new AssetAmount(25_000_000n, poolData.assetA),
};
```

- The `swapType` can be more than one type ([see documentation](/typescript/core/modules/core.html#TSwapType)), but in our case we are setting it to a market order, with a slippage of 0.3% (represented as a number).
- The `poolData` we queried before is added as the pool we're swapping against.
- The `OrderAddresses.DestinationAddress` is just as it sounds: the destination of the scooped swap. Conceptually, the initial order submission will be deposited in a type of escrow account (a smart contract). From there, any on of the SundaeSwap scoopers will process this order, and send the result to whatever we set in this field. In our case, we don't need to attach a datum, since it is going to our wallet address.
- The `suppliedAsset` is how much of our wallet's asset we are supplying to the pool. In our case, we want to supply 25 tADA (`assetA` of the `poolData` object), and receive the matching RBERRY with an acceptable slippage tolerance of 0.03%.

## 3. Requesting a Signature &amp; Submitting

Finally, once we have our configuration all set for the swap, we can build the transaction. Since we're swapping against a V3 pool, let's import the required types:

```ts
import {
  // ...rest of imports
  EContractVersion,
} from "@sundaeswap/core";
```

```ts
// ...rest of our code

const { build, fees } = await SDK.builder(EContractVersion.V3).swap(args);
```

- Here we select the `SDK.builder()` property. By default, the builder uses V1 contracts, so we pass in `EContractVersion.V3` as a parameter.
- From there, we can access the `.swap()` method, and pass in our configured args from the previous step.
- The returned `build` property is what we will use in the next bit of code to actually build the transaction.
- The returned `fees` property is what you can use to get visibility into scooper fees, deposits, and possible referrals (tutorial upcoming).

Next, let's go ahead and build the transaction and request a signature:

```ts
// ... rest of our code

const builtTx = await build();
const { submit, cbor } = await builtTx.sign();

const txHash = await submit();
```

- First, we `build()` the transaction. This removes the details from memory, so manipulating the transaction details after this point is impossible aside form signing it.
- Once we have a built transaction, we can access two things. 1) The `submit` method does what it sounds like: it submits the signed transaction transaction and returns the transaction hash for your record keeping and lookup. 2) The `cbor` property is the signed transaction in its fullness, which can then be used for many other things, including future support for multi-sig orders, manual entry to a different node, etc.

And that's it! Congratulations on your first manually built order on the SundaeSwap protocol. Your submitted transaction with ensured datum correctness is now in the queue, and you should receive your corresponding RBERRY within a minute on preview during normal operation.
