**@sundaeswap/core** • [**Docs**](modules.md)

***

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
