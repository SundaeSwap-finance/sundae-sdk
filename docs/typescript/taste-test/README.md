**@sundaeswap/taste-test** • [**Docs**](globals.md)

***

# Getting Started with Taste Tests

```bash
$ bun add @sundaeswap/taste-test @blaze-cardano/sdk
```

Next, configure the instance in your app:

```ts
import { Blaze } from "@blaze-cardano/sdk";
import { TasteTestBuilder } from "@sundaeswap/taste-test";

const blazeInstance = Blaze.from(
  ...args
);

const TT = new TasteTestBuilder(blazeInstance);
const txHash = await TT.deposit({ ...args }).then(({ submit }) => submit());
```

For more instructions see [Overview](/).
