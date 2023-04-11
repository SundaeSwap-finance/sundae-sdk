---
title: "TxBuilder"
---

# TxBuilder\<Options, Wallet, Tx, QueryProvider\>

The main class by which TxBuilder classes are extended.

## Type parameters

- `Options` = `any`The options that your TxBuilder will take upon instantiating.
- `Wallet` = `any`The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.
- `Tx` = `any`The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
- `QueryProvider` = [`IQueryProviderClass`](../interfaces/IQueryProviderClass.md)

## Hierarchy

- [`TxBuilderLucid`](../../Extensions/classes/TxBuilderLucid.md)

## Methods

### buildAtomicZapTx()

The main function to build an atomic zap Transaction.

#### Signature

```ts
Abstract buildAtomicZapTx(args: IZapArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IZapArgs`](../interfaces/IZapArgs.md) | The built ZapArguments from a [ZapConfig](ZapConfig.md) instance. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L87)

### buildCancelTx()

The main function to build a cancellation Transaction.

#### Signature

```ts
Abstract buildCancelTx(args: CancelConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`CancelConfigArgs`](../interfaces/CancelConfigArgs.md) | The built CancelArguments from a [CancelConfig](CancelConfig.md) instance. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L73)

### buildChainedZapTx()

The currently functioning way to process a chained Zap Transaction.

#### Signature

```ts
Abstract buildChainedZapTx(args: IZapArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IZapArgs`](../interfaces/IZapArgs.md) | The built ZapArguments from a [ZapConfig](ZapConfig.md) instance. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L80)

### buildDepositTx()

The main function to build a deposit Transaction.

#### Signature

```ts
Abstract buildDepositTx(args: DepositConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`DepositConfigArgs`](../interfaces/DepositConfigArgs.md) | The built DepositArguments from a [DepositConfig](DepositConfig.md) instance. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:59](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L59)

### buildSwapTx()

The main function to build a swap Transaction.

#### Signature

```ts
Abstract buildSwapTx(args: SwapConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`SwapConfigArgs`](../interfaces/SwapConfigArgs.md) | The built SwapArguments from a [SwapConfig](SwapConfig.md) instance. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L52)

### buildWithdrawTx()

The main function to build a withdraw Transaction.

#### Signature

```ts
Abstract buildWithdrawTx(args: WithdrawConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`WithdrawConfigArgs`](../interfaces/WithdrawConfigArgs.md) | The built WithdrawArguments from a [WithdrawConfig](WithdrawConfig.md) instance. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L66)

### getParams()

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Signature

```ts
Protected getParams(): IProtocolParams;
```

#### Returns

[`IProtocolParams`](../interfaces/IProtocolParams.md)

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L93)

### newTxInstance()

Should create a new [Transaction](Transaction.md) instance from the supplied transaction library.

#### Signature

```ts
Abstract newTxInstance(): Promise<Transaction<Tx>>;
```

#### Returns

`Promise`\<[`Transaction`](Transaction.md)\<`Tx`\>\>

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L44)
