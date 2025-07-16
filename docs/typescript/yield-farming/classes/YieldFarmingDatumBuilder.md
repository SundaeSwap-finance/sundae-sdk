[**@sundaeswap/yield-farming**](../README.md) • **Docs**

***

# Class: YieldFarmingDatumBuilder

The Blaze representation of a DatumBuilder. The primary purpose of this class
is to encapsulate the accurate building of valid datums, which should be attached
to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
smart contracts. These datums ensure accurate business logic and the conform to the
specs as defined in the SundaeSwap smart contracts.

## Implements

- `DatumBuilderAbstract`

## Methods

### buildLockDatum()

> **buildLockDatum**(`__namedParameters`): `TDatumResult`\<`object`\>

Builds the datum for asset locking, including LP tokens and other
native Cardano assets. There is no need to include an unlockDatum
method, because unlock is equivalent to withdrawing all of a user's
funds.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.owner**

• **\_\_namedParameters.owner.address**: `string` = `...`

• **\_\_namedParameters.programs**: (`"None"` \| `object`)[]

#### Returns

`TDatumResult`\<`object`\>

##### owner

> **owner**: `object`

##### owner.address

> **address**: `string`

##### programs

> **programs**: (`"None"` \| `object`)[]

#### Defined in

[packages/yield-farming/src/lib/DatumBuilder/YieldFarmingDatumBuilder.class.ts:32](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/yield-farming/src/lib/DatumBuilder/YieldFarmingDatumBuilder.class.ts#L32)
