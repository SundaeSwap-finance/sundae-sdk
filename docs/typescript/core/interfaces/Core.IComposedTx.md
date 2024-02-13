# Interface: IComposedTx\<Transaction, BuiltTransaction, Datum, Fees\>

[Core](../modules/Core.md).IComposedTx

The primary top-level API surface for dealing with built TxBuilder transactions.

## Type parameters

| Name | Type |
| :------ | :------ |
| `Transaction` | `unknown` |
| `BuiltTransaction` | `unknown` |
| `Datum` | `string` \| `undefined` |
| `Fees` | `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\> |
