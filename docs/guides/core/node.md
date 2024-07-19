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
import { Blockfrost, Lucid } from "lucid-cardano";

const blockfrost = new Blockfrost("url", "projectId");
const lucid = await Lucid.new(blockfrost, "Preview");
lucid.selectWalletFromSeed("seed");

export { lucid };
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
