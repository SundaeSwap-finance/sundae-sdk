---
"@sundaeswap/core": minor
---

A chained v4 leg may be offered more than the previous leg guarantees.

A chain's datums are all fixed when it is placed, before any leg has filled, so
a later leg could only ever name its predecessor's guaranteed MINIMUM. Whatever
the predecessor won above that arrived in the UTxO unclaimed and came back
unconverted, leaving the owner holding the intermediate asset in proportion to
their slippage setting. On a live 100 ADA -> sUSDrf chain at 3% slippage, the
first leg delivered 22.483230 USDCx, the second claimed 21.808734, and the
0.674496 difference was returned as USDCx rather than converted.

`IChainLegV4.offered` overrides it. A v4 order's `offered` is an UPPER BOUND,
not an exact amount — `check_basic_consumption` checks `consumed <= offered`
per asset — so naming more than arrives does not make the order unfillable; the
scooper consumes what is there. A chain into v4 can therefore state the
expected fill and convert all of it.

Only safe for a leg whose contract bounds consumption that way, which is why it
is a per-leg override rather than the default: v1 and v3 cannot overstate what
they offer.

A caller using it must calibrate `minReceived` against the PESSIMISTIC path —
what the previous leg's minimum converts to. It is an absolute floor checked
gross, not a proportion of what arrived, so an optimistic `offered` paired with
an optimistic floor leaves the order unable to fill whenever the previous leg
underfills.
