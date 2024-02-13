---
title: "taste-test"
has_children: true
parent: "Packages"
nav_order: 3
---

# Getting Started with Taste Tests

```bash
$ yarn add @sundaeswap/taste-test lucid-cardano
```

Next, configure the instance in your app:

```ts
import { SundaeSDK } from "@sundaeswap/core";
import { TasteTestLucid } from "@sundaeswap/taste-test"

const sdk: SundaeSDK = new SundaeSDK({
    ...args
});

const walletInstance = sdk.builder().wallet;
if (!walletInstance) {
    throw new Error()
}

const TT = new TasteTestLucid(walletInstance);
const txHash = await TT.deposit({ ...args }).then(({ submit }) => submit())
```

For more instructions see [Overview](/typescript/).