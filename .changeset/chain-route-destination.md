---
"@sundaeswap/core": minor
---

`orderRouteSwap` can pay a route's final output somewhere other than the owner.

`IOrderRouteSwapArgs.destination` sets where the last leg pays out. It defaults
to `ownerAddress` with no datum, so existing calls build the same transactions.

Only the payout moves: `ownerAddress` still owns every leg and is the only
party that can cancel one. For a v1 last leg that means naming the owner as the
order's alternate, because a v1 order without one can be cancelled only by its
destination.

Script destinations require a datum: v4 requires INLINE, v3 accepts either,
and v1 pays out with a hash. For v1 destinations that are not known order
scripts, supplying INLINE hashes the datum and publishes its bytes under
metadata label 103251; supplying HASH requires the datum to be available
separately. The destination is validated when the last leg is built.

Also fixes a chained v3 leg taking its owner from its destination:
`SwapConfig.buildArgs()` drops `ownerAddress`, and a v3 order falls back to its
destination as owner. That was harmless while the destination was always the
owner, but with a redirected payout it would have let the recipient cancel the
leg.
