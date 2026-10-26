---
"@sundaeswap/core": minor
---

`TxBuilderV4.orderRouteSwap` places chained swaps that start on v4. It takes
`legs`, the orders in the order they fill: the first is the v4 order the
transaction places (`TV4ChainFirstLeg`), and each later one is a `TChainLeg`
the order before it pays into. This covers routes such as v4 → v3,
v4 → v3 → v4 and v4 → v3 → v3 → stableswap, the reverse of the legacy builders'
chains into v4.

The v4 order is a plain intent, like `swapIntent`, with a `Fixed` destination at
the next order's script address carrying that order's datum inline. It does not
use the route constraint that `TxBuilderV4.swap` refuses to build.

Three kinds of chain are refused:

- No v1 order after the v4 one: a v1 order cannot read the inline datum a v4
  order attaches, so its funds could never be spent or cancelled.
- No two v4 orders in a row: one v4 order already routes across any number of
  v4 pools.
- A later v4 order must be the last one; a v4 order in the middle of a chain is
  not supported yet.

For the chains it places:

- Each older-pool order offers exactly the least the order before it can
  deliver. Anything an order wins above that is passed on to the next order's
  destination.
- The v4 order carries every later order's fee, plus the extra routed deposit
  when the chain has more than one later order. `fees.scooperFee` reports the
  v4 budget plus that forwarded ADA.
- `ownerAddress` owns every order, so the owner can cancel any order that
  cannot fill.
- Every order's referral fee is paid in one output, so they must name the same
  destination; differing destinations throw. The label published under
  metadata key 674 is the first one in `legs` order.

The v1 and v3 `orderRouteSwap` builders now compare ADA asset ids alias-aware
(`""`, `"."`, `"ada.lovelace"` are the same asset) when working out which asset
their first leg delivers. An ADA id written in an alias form previously picked
the wrong side of the pool, so the second leg was offered the wrong asset.
