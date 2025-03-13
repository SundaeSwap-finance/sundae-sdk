---
title: "core"
has_children: true
parent: "Packages"
nav_order: 1
---

# Getting Started with Core

```bash
$ bun add @sundaeswap/core @blaze-cardano/sdk
```

Next, configure the instance in your app:

```ts
import { Blaze } from "@blaze-cardano/sdk";
import { SundaeSDK } from "@sundaeswap/core";

const blazeInstance = Blaze.from(
  ...args
);

const sdk = SundaeSDK.new({ blazeInstance });
const txHash = await sdk.swap({ ...args }).then(({ submit }) => submit());
```
