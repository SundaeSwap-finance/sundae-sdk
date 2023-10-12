# Interface: IProtocolParams

[Core](../modules/Core.md).IProtocolParams

The SundaeSwap protocol parameters object.

## Properties

### ESCROW\_ADDRESS

• **ESCROW\_ADDRESS**: `string`

The Bech32 script address of the SundaeSwap Escrow contract.

#### Defined in

[@types/utilities.ts:8](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L8)

___

### ESCROW\_CANCEL\_REDEEMER

• **ESCROW\_CANCEL\_REDEEMER**: `string`

The hex-encoded redeemer value for cancelling Escrow Orders

#### Defined in

[@types/utilities.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L14)

___

### ESCROW\_SCRIPT\_VALIDATOR

• **ESCROW\_SCRIPT\_VALIDATOR**: `string`

The hex-encoded script value of the Escrow Order contract

#### Defined in

[@types/utilities.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L16)

___

### FREEZER\_PAYMENT\_SCRIPTHASH

• **FREEZER\_PAYMENT\_SCRIPTHASH**: `string`

The hex-encoded keyhash for the Yield Farming contract.

#### Defined in

[@types/utilities.ts:20](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L20)

___

### FREEZER\_REFERENCE\_INPUT

• **FREEZER\_REFERENCE\_INPUT**: `string`

The hex-enc

#### Defined in

[@types/utilities.ts:22](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L22)

___

### FREEZER\_STAKE\_KEYHASH

• **FREEZER\_STAKE\_KEYHASH**: `string`

The hex-encoded staking key for the Yield Farming lockups.

#### Defined in

[@types/utilities.ts:18](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L18)

___

### RIDER\_FEE

• **RIDER\_FEE**: `bigint`

The minimum amount of ADA to deliver assets with.

#### Defined in

[@types/utilities.ts:12](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L12)

___

### SCOOPER\_FEE

• **SCOOPER\_FEE**: `bigint`

The fee paid to Scoopers who process transactions.

#### Defined in

[@types/utilities.ts:10](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L10)
