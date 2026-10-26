---
"@sundaeswap/core": minor
---

`TxBuilderV4.orderRouteSwap` places chained swaps that start on v4: a v4 intent
whose payout lands as a v3 or stableswap order, optionally followed by one more
leg (v4, v3 or stableswap). This covers routes such as v4 → v3 and
v4 → v3 → v4, the reverse of the legacy builders' chains into v4.

The v4 leg is a plain intent, like `swapIntent`, with a `Fixed` destination at
the next order's script address carrying that order's datum inline. It does not
use the route constraint that `TxBuilderV4.swap` refuses to build.

- The legacy leg offers exactly the v4 leg's `minReceived`. Anything the v4 leg
  wins above that is passed on to the legacy order's destination.
- The v4 order carries every later leg's fee, plus the extra routed deposit when
  the legacy leg forwards into a third leg. `fees.scooperFee` reports the v4
  budget plus that forwarded ADA.
- `ownerAddress` owns every leg, so the owner can cancel any leg that cannot
  fill.
- Every leg's referral fee is paid in one output, so they must name the same
  destination; differing destinations throw. The label published under
  metadata key 674 is the first leg's that has one, in leg order.
- v1 legs are refused: a v1 order cannot read the inline datum a v4 order
  attaches, so its funds could never be spent or cancelled.

The v1 and v3 `orderRouteSwap` builders now compare ADA asset ids alias-aware
(`""`, `"."`, `"ada.lovelace"` are the same asset) when working out which asset
their first leg delivers. An ADA id written in an alias form previously picked
the wrong side of the pool, so the second leg was offered the wrong asset.
