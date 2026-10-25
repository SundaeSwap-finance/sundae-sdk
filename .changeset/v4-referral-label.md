---
"@sundaeswap/core": patch
---

`TxBuilderV4` now publishes a referral fee's `feeLabel` under metadata key 674,
as the v1 and v3 builders do. Every v4 order, batch, cancel and pool mint paid
the referral but dropped its label.
