# Class: AssetAmount

This class takes care of resolving asset amounts based on their diminutive amounts vs their decimal amounts.
Each asset is registered with a decimal place for it's token.

**`Example`**

To create a class for 2.005 ADA, you would enter the lovelace amount as a `BigInt`,
as well as the decimal place as a number, which is `6`.

```ts
const myAsset = new AssetAmount(2005000n, 6);

myAsset.getAmount() // 2005000n
myAsset.getDecimals() // 6
myAsset.getDenominatedAmount() // 2.005000
```

## Constructors

### constructor

• **new AssetAmount**(`amount`, `decimals?`)

Construct a new AssetAmount.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `bigint` | Diminutive amount of the asset, without decimals. |
| `decimals?` | `number` | The registered decimals of the asset token. |

#### Defined in

[classes/AssetAmount.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L28)

## Methods

### getAmount

▸ **getAmount**(): `bigint`

Returns the provided diminutive amount of the asset, without a decimal place.

#### Returns

`bigint`

#### Defined in

[classes/AssetAmount.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L46)

___

### getDecimals

▸ **getDecimals**(): `number`

Returns the provided decimal place of the asset amount.

#### Returns

`number`

#### Defined in

[classes/AssetAmount.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L54)

___

### getDenominatedAmount

▸ **getDenominatedAmount**(): `number`

Converts a BigInt to a float based on the provided decimal place.

#### Returns

`number`

#### Defined in

[classes/AssetAmount.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L37)
