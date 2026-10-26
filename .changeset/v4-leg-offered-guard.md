---
"@sundaeswap/core": patch
---

A chained v4 order's `offered` override (`IChainLegV4.offered`) is now checked
against what the order before it delivers, in both `orderRouteSwap` directions:

- It must name the asset that arrives. Naming another asset built an order that
  could never fill.
- It cannot name more ADA than the order before it guarantees. The v4 scooper
  spends the full offered lovelace, so an ADA offer above what arrived was paid
  from the order's deposit and budget, and once those ran out the order could
  not fill. The docs said over-offering was always safe; that holds only for
  native tokens, which the scooper caps at what the order holds.

Both cases now throw.
