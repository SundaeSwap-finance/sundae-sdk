[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Variable: V4\_VALIDATORS

> `const` **V4\_VALIDATORS**: `object`

The validator titles the v4 builder resolves out of the protocol params
(via the Sundae API `protocols` query — the same source V3 uses). These are
the deployment's canonical module keys, matching the `V4` entry in the
`*-sundae-protocol--protocol` table, which is populated from the sundae-v4
deployment blueprint (`<network>-blueprint.json`) — dotted `module.purpose`
titles matching the V1/V3/Stableswaps convention (`pool.mint`,
`order.spend`, …), not the kebab-case names the scooper's own config uses.

## Type declaration

### basicConstraint

> `readonly` **basicConstraint**: `"basic_order.withdraw"` = `"basic_order.withdraw"`

The basic-order constraint module — keyed in Deposit/Withdraw/Claim orders.

### constantSum

> `readonly` **constantSum**: `"constant_sum.withdraw"` = `"constant_sum.withdraw"`

The constant-sum curve module.

### fairnessConstraint

> `readonly` **fairnessConstraint**: `"fairness_order.withdraw"` = `"fairness_order.withdraw"`

The fairness-order constraint module — required by every order type.

### fairnessModule

> `readonly` **fairnessModule**: `"fairness.withdraw"` = `"fairness.withdraw"`

The fairness pool module (distinct from the `fairness_order` constraint).

### feeSplit

> `readonly` **feeSplit**: `"fee_split.withdraw"` = `"fee_split.withdraw"`

The fee-split module carried by every pool.

### order

> `readonly` **order**: `"order.spend"` = `"order.spend"`

The order spend validator — its hash forms the order script address.

### pool

> `readonly` **pool**: `"pool.spend"` = `"pool.spend"`

The pool spend validator — its hash is the pool script address.

### poolMint

> `readonly` **poolMint**: `"pool.mint"` = `"pool.mint"`

The pool NFT minting policy.

### routeConstraint

> `readonly` **routeConstraint**: `"route_order.withdraw"` = `"route_order.withdraw"`

The route-order constraint module — required by swap (and strategy) orders.

### strategyConstraint

> `readonly` **strategyConstraint**: `"strategy_order.withdraw"` = `"strategy_order.withdraw"`

The strategy-order constraint module — keyed in a strategy order's constraints.

### swapConstraint

> `readonly` **swapConstraint**: `"swap_order.withdraw"` = `"swap_order.withdraw"`

The swap-order constraint module — keyed in a Swap order's constraints.

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L41)
