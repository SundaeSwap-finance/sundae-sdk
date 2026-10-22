---
"@sundaeswap/core": patch
---

V1 orders name an inline destination datum by its hash and publish the datum
under metadata label 103251, so a scooper can supply it. Previously the datum's
raw bytes went where V1 expects a hash, so the order could never fill.

V1 zap and order-route swaps also keep a referral fee's 674 label now, which
publishing their chained datum used to drop.
