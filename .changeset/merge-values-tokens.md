---
"@sundaeswap/core": patch
---

`BlazeHelper.mergeValues` now sums native tokens across every value. It reset
its token map for each token-bearing input, so only the last one's tokens
survived: merged referral fees in `orderRouteSwap` (v1, v3, v4) and in
cancel-and-replace updates under-paid token referrals.
