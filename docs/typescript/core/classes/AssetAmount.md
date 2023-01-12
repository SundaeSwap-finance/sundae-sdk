# Class: AssetAmount

This class takes care of resolving asset amounts based on their diminutive amounts vs their decimal amounts.
Each asset is registered with a decimal place for it's token.

**`Example`**

To create a class for 10 ADA, you would enter the lovelace amount `10000000`
as well as the decimal place that is registered, which is `6`.

```ts
const myAsset = new AssetAmount(2000000n, 6);

myAsset.getAmount() // 2
myAsset.getRawAmount() // 2000000
myAsset.getDecimals() // 6
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

[classes/AssetAmount.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/4629b39/packages/core/src/classes/AssetAmount.class.ts#L28)
