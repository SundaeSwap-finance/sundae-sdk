# Class: FreezerConfig

[Core](../modules/Core.md).FreezerConfig

The main config class for building valid arguments for a Freezer transaction.

## Hierarchy

- `Config`<[`FreezerConfigArgs`](../interfaces/Core.FreezerConfigArgs.md)\>

  ↳ **`FreezerConfig`**

## Methods

### setReferralFee

▸ **setReferralFee**(`fee`): `void`

An inherited method that allows a config to add an optional referral fee.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fee` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) | The desired fee. |

#### Returns

`void`

#### Inherited from

Config.setReferralFee

#### Defined in

[classes/Abstracts/Config.abstract.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/Config.abstract.class.ts#L39)
