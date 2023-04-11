---
title: "DatumResult"
---

# DatumResult\<T\>

The returned results of a [DatumBuilder](../classes/DatumBuilder.md) method.

## Type parameters

- `T` = `any`

## Properties

### cbor

> `string`

The hex-encoded CBOR string of the datum

Defined in:  [@types/datumbuilder.ts:141](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L141)

### datum

> `T`

The datum type of the library used to build it.

Defined in:  [@types/datumbuilder.ts:145](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L145)

### hash?

> `string`

The hex-encoded hash of the CBOR string

Defined in:  [@types/datumbuilder.ts:143](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L143)
