---
title: "AssetAmount"
---

# AssetAmount

This class takes care of resolving asset amounts based on their diminutive amounts vs their decimal amounts.
Each asset is registered with a decimal place for it's token.

## Example

To create a class for 2.005 ADA, you would enter the lovelace amount as a `BigInt`,
as well as the decimal place as a number, which is `6`.

```ts
const myAsset = new AssetAmount(2005000n, 6);

myAsset.getAmount() // 2005000n
myAsset.getDecimals() // 6
myAsset.getDenominatedAmount() // 2.005000
```

## Constructors

## constructor()

Construct a new AssetAmount.

### Signature

```ts
new AssetAmount(amount: bigint, decimals?: number): AssetAmount;
```

### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `bigint` | Diminutive amount of the asset, without decimals. |
| `decimals?` | `number` | The registered decimals of the asset token. |

### Returns

[`AssetAmount`](AssetAmount.md)

Defined in:  [classes/AssetAmount.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L28)

## Methods

### add()

Helper method to increment the asset amount.

#### Signature

```ts
add(amt: bigint): AssetAmount;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `amt` | `bigint` |

#### Returns

[`AssetAmount`](AssetAmount.md)

Defined in:  [classes/AssetAmount.class.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L62)

### getAmount()

Returns the provided diminutive amount of the asset, without a decimal place.

#### Signature

```ts
getAmount(): bigint;
```

#### Returns

`bigint`

Defined in:  [classes/AssetAmount.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L46)

### getDecimals()

Returns the provided decimal place of the asset amount.

#### Signature

```ts
getDecimals(): number;
```

#### Returns

`number`

Defined in:  [classes/AssetAmount.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L54)

### getDenominatedAmount()

Converts a BigInt to a float based on the provided decimal place.

#### Signature

```ts
getDenominatedAmount(): number;
```

#### Returns

`number`

Defined in:  [classes/AssetAmount.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L37)

### subtract()

Helper method to subtract the asset amount.

#### Signature

```ts
subtract(amt: bigint): AssetAmount;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `amt` | `bigint` |

#### Returns

[`AssetAmount`](AssetAmount.md)

Defined in:  [classes/AssetAmount.class.ts:71](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/AssetAmount.class.ts#L71)
