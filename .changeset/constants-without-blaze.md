---
"@sundaeswap/core": patch
---

`@sundaeswap/core/utilities` no longer pulls in the Cardano serialization
library. `constants.ts` built `VOID_BYTES` with `@blaze-cardano/sdk` and
`@blaze-cardano/data`, and `SundaeUtils` imports `constants.ts`, so any app that
imported only `SundaeUtils` or a plain constant shipped all of blaze (about
290 KB brotli in the dex app's first load).

`VOID_BYTES` is removed; the datum builders that used it now build the empty
`extension` value inline.
