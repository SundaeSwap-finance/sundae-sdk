---
"@sundaeswap/core": minor
---

Adopt the audit-final v4 PoolDatum, PoolConfig and order constraint sets — the
shapes the deployed launch scripts actually enforce.

`PoolDatum` gains `min_surplus` and `extension` (ADR-0012); `buildPoolDatum`
takes the surplus floor and pins a Void extension. `PoolConfig` is fully ported
(`module_params`, `mint_permission`, `min_surplus`, `extension`) and `mintPool`
pins the config's `min_surplus` into the datum it writes. `resolvePoolConfig`
accepts the per-curve entry labels the deployment publishes — `cs-pool`,
`cp-pool`, `cl-pool` — alongside the bare `pool` label of earlier eras. Reads
stay lenient, so datums from an older deployment still decode.

Order constraints are now derived from the settings entry's `OrderConfig`
rather than hardcoded. The order validator requires the datum's constraint list
to match its config exactly, and which constraints a package carries is
deployment-defined: the audited launch packages are `trade + fee`, where
earlier deployments used `trade + fairness`. `buildBasicPlacement` and
`strategy` parse the entry and fill each required constraint, so an order built
against the launch deployment is accepted rather than rejected for carrying the
wrong set. A caller-supplied `configToken` that is not indexed falls back to the
legacy package.

Without this, orders built by a published SDK carry `[basic, fairness]` and no
fill is valid against the launch scripts.
