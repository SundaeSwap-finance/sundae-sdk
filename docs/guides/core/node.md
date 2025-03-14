---
title: Node
nav_order: 1
has_children: true
parent: Core
---

Building transactions in Node will require you to setup your own TxBuilder instances. This is because
the `SundaeSDK` class assumes a browser environment. Setting things up is pretty simple however:

### Setup

```ts
// utils.ts
import { Blaze, Blockfrost, HotWallet } from "@blaze-cardano/sdk";
import { ETxBuilderType, ISundaeSDKOptions, SundaeSDK } from "@sundaeswap/core";

// Get the API from the browser window.
const myBlockfrostApiKey = "";
const provider = new Blockfrost({ network: "cardano-preview", projectId: myBlockfrostApiKey });
const blaze = Blaze.from(
  provider,
  await HotWallet.fromMasterkey(
    Core.Bip32PrivateKeyHex("your-private-key"),
    provider,
    Core.NetworkId.Testnet,
  ),
);

const options: ISundaeSDKOptions = {
  wallet: {
    name: "eternl",
    network: "preview",
    blazeInstance,
  },
};

const SDK = SundaeSDK.new(options);
```

### V1 Contracts

To build transactions for the V1 contracts, setup your builder like this:

```ts
import { TxBuilderLucidV1, DatumBuilderLucidV1 } from "@sundaeswap/core/lucid";

import { lucid } from "path/to/utils.ts";

const txBuilder = new TxBuilderLucidV1(
  lucid,
  new DatumBuilderLucidV1("preview")
);

// Do your swap like normal.
const result = await txBuilder.swap({ ...args });
```

### V3 Contracts

To build transaction for the V3 contracts, setup your builder like this:

```ts
import { TxBuilderLucidV3, DatumBuilderLucidV3 } from "@sundaeswap/core/lucid";

import { lucid } from "path/to/utils.ts";

const txBuilder = new TxBuilderLucidV3(
  lucid,
  new DatumBuilderLucidV3("preview")
);

// Do your swap like normal.
const result = await txBuilder.swap({ ...args });
```

### Query Providers

To access a QueryProvider, use this:

```ts
import { QueryProviderSundaeSwap } from "@sundaeswap/core";
const queryProvider = new QueryProviderSundaeSwap("preview");
const ident = "...uniqueIdent...";
const result = await queryProvider.findPoolData({ ident });
```
