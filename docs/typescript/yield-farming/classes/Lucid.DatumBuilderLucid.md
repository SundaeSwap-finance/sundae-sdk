# Class: DatumBuilderLucid

[Lucid](../modules/Lucid.md).DatumBuilderLucid

The Lucid representation of a DatumBuilder. The primary purpose of this class
is to encapsulate the accurate building of valid datums, which should be attached
to transactions that are constructed and sent to the SundaeSwap Yield Farming V2
smart contracts. These datums ensure accurate business logic and the conform to the
specs as defined in the SundaeSwap smart contracts.

## Implements

- `DatumBuilder`

## Methods

### buildLockDatum

▸ **buildLockDatum**(`«destructured»`): `TDatumResult`\<\{ `owner`: \{ `address`: `string`  } ; `programs`: (``"None"`` \| \{ `Delegation`: [`string`, `string`, `bigint`]  })[]  }\>

Builds the datum for asset locking, including LP tokens and other
native Cardano assets. There is no need to include an unlockDatum
method, because unlock is equivalent to withdrawing all of a user's
funds.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `owner` | `Object` |
| › `owner.address` | `string` |
| › `programs` | (``"None"`` \| \{ `Delegation`: [`string`, `string`, `bigint`]  })[] |

#### Returns

`TDatumResult`\<\{ `owner`: \{ `address`: `string`  } ; `programs`: (``"None"`` \| \{ `Delegation`: [`string`, `string`, `bigint`]  })[]  }\>

#### Defined in

[packages/yield-farming/src/lib/DatumBuilder/DatumBuilder.YieldFarming.Lucid.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/yield-farming/src/lib/DatumBuilder/DatumBuilder.YieldFarming.Lucid.class.ts#L28)
