[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: WithdrawConfig

The `WithdrawConfig` class helps to properly format your withdraw arguments for use within [Core.TxBuilderV1](TxBuilderV1.md) or [Core.TxBuilderV3](TxBuilderV3.md).

## Example

```ts
const config = new WithdrawConfig()
  .setPool( /** ...pool data... */)
  .setSuppliedLPAsset({
    assetId: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    amount: new AssetAmount(20n, 6),
  })
  .setOrderAddresses({
     DestinationAddress: {
       address: "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
     }
  });

const { submit, cbor } = await SDK.swap(config);
```

## Extends

- `LiquidityConfig`\<[`IWithdrawConfigArgs`](../interfaces/IWithdrawConfigArgs.md)\>

## Properties

### orderAddresses?

> `optional` **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Inherited from

`LiquidityConfig.orderAddresses`

#### Defined in

[packages/core/src/Abstracts/LiquidityConfig.abstract.class.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/LiquidityConfig.abstract.class.ts#L14)

***

### referralFee?

> `optional` **referralFee**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

An optional argument that contains referral fee data.

#### Inherited from

`LiquidityConfig.referralFee`

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L16)

## Methods

### buildArgs()

> **buildArgs**(): [`IWithdrawConfigArgs`](../interfaces/IWithdrawConfigArgs.md)

Build a valid arguments object for a TxBuilder withdraw method.

#### Returns

[`IWithdrawConfigArgs`](../interfaces/IWithdrawConfigArgs.md)

#### Overrides

`LiquidityConfig.buildArgs`

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:63](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L63)

***

### setFromObject()

> **setFromObject**(`__namedParameters`): `void`

Set the default arguments from a JSON object as opposed to individually.

#### Parameters

• **\_\_namedParameters**: [`IWithdrawConfigArgs`](../interfaces/IWithdrawConfigArgs.md)

#### Returns

`void`

#### Overrides

`LiquidityConfig.setFromObject`

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L39)

***

### setOrderAddresses()

> **setOrderAddresses**(`orderAddresses`): [`WithdrawConfig`](WithdrawConfig.md)

Set the addresses for a swap's required datum.

#### Parameters

• **orderAddresses**: [`TOrderAddressesArgs`](../type-aliases/TOrderAddressesArgs.md)

The addresses for the order.

#### Returns

[`WithdrawConfig`](WithdrawConfig.md)

The current instance of the class.

#### Inherited from

`LiquidityConfig.setOrderAddresses`

#### Defined in

[packages/core/src/Abstracts/LiquidityConfig.abstract.class.ts:21](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/LiquidityConfig.abstract.class.ts#L21)

***

### setReferralFee()

> **setReferralFee**(`fee`): `void`

An inherited method that allows a config to add an optional referral fee.

#### Parameters

• **fee**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

The desired fee.

#### Returns

`void`

#### Inherited from

`LiquidityConfig.setReferralFee`

#### Defined in

[packages/core/src/Abstracts/Config.abstract.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/Config.abstract.class.ts#L40)

***

### setSuppliedLPAsset()

> **setSuppliedLPAsset**(`asset`): [`WithdrawConfig`](WithdrawConfig.md)

Set the funded asset of LP tokens.

#### Parameters

• **asset**: `AssetAmount`\<`IAssetAmountMetadata`\>

#### Returns

[`WithdrawConfig`](WithdrawConfig.md)

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L54)

***

### validate()

> **validate**(): `void`

Validates the current config and throws an Error if any required item is not set.

#### Returns

`void`

#### Overrides

`LiquidityConfig.validate`

#### Defined in

[packages/core/src/Configs/WithdrawConfig.class.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Configs/WithdrawConfig.class.ts#L75)
