[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Variable: V4\_VALIDATORS

> `const` **V4\_VALIDATORS**: `object`

The validator titles the v4 builder resolves out of the protocol params
(via the Sundae API `protocols` query — the same source V3 uses). These are
the deployment's canonical module keys, matching the `V4` entry in the
`*-sundae-protocol--protocol` table, which is populated from the sundae-v4
deployment blueprint (`<network>-blueprint.json`) — camelCase titles like
`routeOrder`, not the kebab-case names the scooper's own config uses.

## Type declaration

### basicConstraint

> `readonly` **basicConstraint**: `"basicOrder"` = `"basicOrder"`

The basic-order constraint module — keyed in Deposit/Withdraw/Claim orders.

### constantSum

> `readonly` **constantSum**: `"constantSum"` = `"constantSum"`

The constant-sum curve module.

### fairnessConstraint

> `readonly` **fairnessConstraint**: `"fairnessOrder"` = `"fairnessOrder"`

The fairness-order constraint module — required by every order type.

### fairnessModule

> `readonly` **fairnessModule**: `"fairness"` = `"fairness"`

The fairness pool module (distinct from the `fairnessOrder` constraint).

### feeSplit

> `readonly` **feeSplit**: `"feeSplit"` = `"feeSplit"`

The fee-split module carried by every pool.

### order

> `readonly` **order**: `"order"` = `"order"`

The order spend validator — its hash forms the order script address.

### pool

> `readonly` **pool**: `"pool"` = `"pool"`

The pool spend validator — its hash is the pool script address.

### poolMint

> `readonly` **poolMint**: `"poolMint"` = `"poolMint"`

The pool NFT minting policy.

### routeConstraint

> `readonly` **routeConstraint**: `"routeOrder"` = `"routeOrder"`

The route-order constraint module — required by swap (and strategy) orders.

### strategyConstraint

> `readonly` **strategyConstraint**: `"strategyOrder"` = `"strategyOrder"`

The strategy-order constraint module — keyed in a strategy order's constraints.

### swapConstraint

> `readonly` **swapConstraint**: `"swapOrder"` = `"swapOrder"`

The swap-order constraint module — keyed in a Swap order's constraints.

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L40)
