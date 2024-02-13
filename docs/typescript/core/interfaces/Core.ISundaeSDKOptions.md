# Interface: ISundaeSDKOptions

[Core](../modules/Core.md).ISundaeSDKOptions

The SundaeSDK options argument when creating a new instance.

## Properties

### customQueryProvider

• `Optional` **customQueryProvider**: [`QueryProvider`](../classes/Core.QueryProvider.md)

An optional custom QueryProvider for general protocol queries.

#### Defined in

[packages/core/src/@types/index.ts:10](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L10)

___

### debug

• `Optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Defined in

[packages/core/src/@types/index.ts:12](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L12)

___

### minLockAda

• `Optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Defined in

[packages/core/src/@types/index.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L14)

___

### wallet

• **wallet**: `Object`

The wallet options.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `builder` | [`ILucidBuilder`](Core.ILucidBuilder.md) | The type of builder to use. Currently only supports Lucid. |
| `name` | [`TSupportedWallets`](../modules/Core.md#tsupportedwallets) | A CIP-30 compatible wallet. |
| `network` | ``"mainnet"`` \| ``"preview"`` | The desired network. |

#### Defined in

[packages/core/src/@types/index.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L16)
