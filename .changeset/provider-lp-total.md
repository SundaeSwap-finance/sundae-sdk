---
"@sundaeswap/core": patch
---

`QueryProviderSundaeSwap` now denominates `liquidity.lpTotal` in the pool's
`total_lp`, not its circulating LP supply.

Every v4 curve module divides by the pool datum's `total_lp` — circulating LP
plus the protocol's earned-but-unharvested fees — and concentrated liquidity
uses it as its liquidity term `L`. The provider mapped `current.quantityLP`
instead, which is the circulating supply alone, so any v4 deposit, withdrawal
or concentrated-liquidity swap quoted from a pool this provider returned was
computed against a different pool than the chain validates. Measured on live v4
pools, the gap reaches 0.16% of the supply.

Pre-v4 pools are unaffected in value. There is no separate fee accounting
before v4, so `totalLp` and `current.quantityLP` are the same number — verified
across 222 live v1, v3 and Stableswaps pools on mainnet, preview and preprod,
with no exception. The mapping is therefore uniform rather than version-aware.

`QueryProviderSundaeSwapLegacy` is deliberately unchanged: it queries the stats
API, whose schema has no `totalLp` field and which serves pre-v4 pools only,
where the circulating supply is the right denominator.
