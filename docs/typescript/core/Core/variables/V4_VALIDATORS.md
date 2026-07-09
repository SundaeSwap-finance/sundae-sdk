[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Variable: V4\_VALIDATORS

> `const` **V4\_VALIDATORS**: `object`

The validator titles the v4 builder resolves out of the protocol params
(via the Sundae API `protocols` query — the same source V3 uses). These are
the deployment's canonical module keys, matching the `V4` entry in the
`*-sundae-protocol--protocol` table (which is populated from the scooper's
deployment config, e.g. scooper-v2 `config/<network>-v4.json` module-scripts).

## Type declaration

### basicConstraint

> `readonly` **basicConstraint**: `"basic-order"` = `"basic-order"`

The basic-order constraint module — keyed in Deposit/Withdraw/Claim orders.

### constantSum

> `readonly` **constantSum**: `"constant-sum"` = `"constant-sum"`

The constant-sum curve module.

### fairnessConstraint

> `readonly` **fairnessConstraint**: `"fairness-order"` = `"fairness-order"`

The fairness-order constraint module — required by every order type.

### fairnessModule

> `readonly` **fairnessModule**: `"fairness"` = `"fairness"`

The fairness pool module (distinct from the `fairness-order` constraint).

### feeSplit

> `readonly` **feeSplit**: `"fee-split"` = `"fee-split"`

The fee-split module carried by every pool.

### order

> `readonly` **order**: `"order"` = `"order"`

The order spend validator — its hash forms the order script address.

### pool

> `readonly` **pool**: `"pool"` = `"pool"`

The pool spend validator — its hash is the pool script address.

### poolMint

> `readonly` **poolMint**: `"pool-mint"` = `"pool-mint"`

The pool NFT minting policy.

### routeConstraint

> `readonly` **routeConstraint**: `"route-order"` = `"route-order"`

The route-order constraint module — required by swap (and strategy) orders.

### swapConstraint

> `readonly` **swapConstraint**: `"swap-order"` = `"swap-order"`

The swap-order constraint module — keyed in a Swap order's constraints.

## Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L39)
