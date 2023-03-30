---
title: "IProtocolParams"
---

# IProtocolParams

The SundaeSwap protocol parameters object.

## Properties

### ESCROW\_ADDRESS

> `string`

The Bech32 script address of the SundaeSwap Escrow contract.

Defined in:  [@types/utilities.ts:8](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L8)

### ESCROW\_CANCEL\_REDEEMER

> `string`

The hex-encoded redeemer value for cancelling Escrow Orders

Defined in:  [@types/utilities.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L14)

### ESCROW\_SCRIPT\_VALIDATOR

> `string`

The hex-encoded script value of the Escrow Order contract

Defined in:  [@types/utilities.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L16)

### RIDER\_FEE

> `bigint`

The minimum amount of ADA to deliver assets with.

Defined in:  [@types/utilities.ts:12](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L12)

### SCOOPER\_FEE

> `bigint`

The fee paid to Scoopers who process transactions.

Defined in:  [@types/utilities.ts:10](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L10)
