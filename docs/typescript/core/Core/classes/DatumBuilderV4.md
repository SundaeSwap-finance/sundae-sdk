[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: DatumBuilderV4

Datum + redeemer builder for sundae-v4 transactions.

Unlike v1/v3 — where one Order datum shape served the whole protocol —
v4 splits intent into a list of (`module_hash`, `data`) constraints
attached to a generic `OrderDatum`. The basic / swap / strategy
methods on this class each construct one of those constraint entries
and assemble the surrounding OrderDatum.

Phase 1 ships the class skeleton only; the concrete encoders land in
Phase 2 (ported from sundae-v4's CLI helpers).

## Implements

- [`DatumBuilderAbstract`](DatumBuilderAbstract.md)

## Properties

### network

> **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:18](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L18)
