---
title: "gummiworm"
has_children: true
parent: "Packages"
nav_order: 5
---

# Getting Started with GummiWorm

```bash
$ bun add @sundaeswap/core @sundaeswap/gummiworm lucid-cardano
```

Next, configure the instance in your app:

```ts
import { SundaeSDK } from "@sundaeswap/core";
import { GummiWormLucid } from "@sundaeswap/gummiworm";

const sdk: SundaeSDK = await SundaeSDK.new({
  ...args,
});

const GW = new GummiWormLucid(sdk);
const txHash = await GW.deposit({ ...args }).then(({ submit }) => submit());
```

For more instructions see [Overview](/).
