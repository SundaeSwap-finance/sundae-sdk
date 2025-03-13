**@sundaeswap/yield-farming** • [**Docs**](globals.md)

***

# Getting Started with Taste Tests

```bash
$ bun add @sundaeswap/yield-farming @blaze-cardano/sdk
```

Next, configure the instance in your app:

```ts
import { Blaze } from "@blaze-cardano/sdk";
import { YieldFarmingBuilder } from "@sundaeswap/yield-farming";

const blazeInstance = Blaze.from(
  // Blaze args.
);

const YF = new YieldFarmingBuilder(blazeInstance);
const txHash = await YF.lock({ ...args }).then(({ submit }) => submit());
```
