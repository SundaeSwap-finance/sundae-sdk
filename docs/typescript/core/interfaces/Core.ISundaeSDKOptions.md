# Interface: ISundaeSDKOptions

[Core](../modules/Core.md).ISundaeSDKOptions

The SundaeSDK options argument when creating a new instance.

## Properties

### customQueryProvider

• `Optional` **customQueryProvider**: [`QueryProvider`](../classes/Core.QueryProvider.md)

An optional custom QueryProvider for general protocol queries.

#### Defined in

[packages/core/src/@types/index.ts:9](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L9)

___

### debug

• `Optional` **debug**: `boolean`

Whether to allow debugging console logs.

#### Defined in

[packages/core/src/@types/index.ts:11](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L11)

___

### minLockAda

• `Optional` **minLockAda**: `bigint`

The minimum amount of ADA required for a locking position.

#### Defined in

[packages/core/src/@types/index.ts:13](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L13)

___

### wallet

• **wallet**: `Object`

The wallet options.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `builder` | [`ILucidBuilder`](Core.ILucidBuilder.md) | The type of builder to use. Currently only supports Lucid. |
| `name` | `string` | A CIP-30 compatible wallet. |
| `network` | ``"mainnet"`` \| ``"preview"`` | The desired network. |

#### Defined in

[packages/core/src/@types/index.ts:15](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/index.ts#L15)
