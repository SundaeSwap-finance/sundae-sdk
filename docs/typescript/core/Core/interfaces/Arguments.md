---
title: "Arguments"
---

# Arguments

Base arguments for every datum constructor.

## Hierarchy

- [`SwapArguments`](SwapArguments.md)
- [`WithdrawArguments`](WithdrawArguments.md)
- [`DepositArguments`](DepositArguments.md)
- [`ZapArguments`](ZapArguments.md)

## Properties

### ident

> `string`

The unique pool identifier.

Defined in:  [@types/datumbuilder.ts:98](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L98)

### orderAddresses

> [`OrderAddresses`](../types/OrderAddresses.md)

The addresses that are allowed to cancel the Order.

Defined in:  [@types/datumbuilder.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L102)

### scooperFee?

> `bigint`

The fee paid to scoopers. Defaults to 2.5 ADA which is the minimum.

Defined in:  [@types/datumbuilder.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L100)
