---
"@sundaeswap/core": minor
---

A v3 order can chain into a v4 intent.

`orderRouteSwap` already chains across versions: leg A's payout destination is
leg B's order script address, carrying leg B's datum. v4 was unreachable as a
chain target, so a route crossing from v3 into v4 could not be built.

`Utilities/ChainLeg.ts` describes a chain leg from the point of view of the leg
before it — order address, datum, datum type, and the ADA to forward — and
dispatches on the leg's contract version. A v4 leg is placed through
`swapIntent`, because `TxBuilderV4.swap` throws by design, and is reached
through the explicit `builder(V4)` overload, so the shared `TTxBuilder` union
is unchanged. `TxBuilderV4` gains `getDatumType`, which returns `INLINE`.

`IOrderRouteSwapArgs.swapB` now accepts either a legacy swap against one pool
or a v4 intent (`IChainLegV4`). A v4 tail is a SINGLE leg: a v4 order is
pool-agnostic and the scooper routes and splits it across any number of v4
pools inside one scoop, so a three-pool route whose tail is v4 places two
orders, not three.

`OrderAddresses.PoolDestinationScooperFee` states the destination order's
exact budget, instead of querying a constant the destination version may not
have — a v4 order's `service_budget` is chosen per order. The existing getter
path still runs when it is omitted, so `v1 -> v3` and `v3 -> v3` are unchanged.

`TxBuilderV1.orderRouteSwap` refuses a v4 leg: a v1 order names its
destination datum by hash, and a v4 order needs an inline datum to be
spendable, so the chain would place a UTxO no scooper can spend.
