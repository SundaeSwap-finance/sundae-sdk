---
"@sundaeswap/core": minor
---

Add Sundae v4 support to the SDK: `TxBuilderV4` with `swap`, `basic`
(`deposit`/`withdraw`/`claim`), `strategy`, `cancel`, `update`, and `mintPool`
(constant-sum), plus `getPoolByIdent` for v4-native pool lookup. Orders resolve
their `config_token` and defaults (share-batcher) from the protocol settings,
and pool creation follows the on-chain `PoolConfig` generically (modules
resolved by hash → title → reference, configs read from settings). The composed
`fees.scooperFee` now reflects the order's reserved `budget`.
