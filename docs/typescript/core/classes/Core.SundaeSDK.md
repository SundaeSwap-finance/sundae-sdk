# Class: SundaeSDK

[Core](../modules/Core.md).SundaeSDK

The main SundaeSDK class that contains all the necessary sub-classes for
interacting with the SundaeSwap protocol.

```ts
const sdk = new SundaeSDK({
  baseType: EBasePrototype.Lucid,
  network: "preview"
});

sdk.builder().buildSwapTx({ ...args })
  .then(async ({ build, sign }) => {
    const { fees } = await build();
    console.log(fees);

    const { submit } = await sign();
    const txHash = submit();

    console.log(txHash);
  })
```

## Constructors

### constructor

• **new SundaeSDK**(`args`): [`SundaeSDK`](Core.SundaeSDK.md)

Builds a class instance using the arguments specified.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md) | The primary arguments object for the SDK. |

#### Returns

[`SundaeSDK`](Core.SundaeSDK.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L55)

## Methods

### builder

▸ **builder**(`contractVersion`): [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |

#### Returns

[`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:117](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L117)

▸ **builder**(`contractVersion`): [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |

#### Returns

[`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L118)

▸ **builder**(`contractVersion?`): [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md) \| [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion?` | [`EContractVersion`](../enums/Core.EContractVersion.md) |

#### Returns

[`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md) \| [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:119](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L119)

___

### getOptions

▸ **getOptions**(): [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L112)

___

### query

▸ **query**(): [`QueryProvider`](Core.QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](Core.QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:152](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L152)

___

### registerTxBuilders

▸ **registerTxBuilders**(): `void`

Registers TxBuilders depending on the TxBuilder
type. Currently we only support Lucid, but plan on adding
more types in the future. This gives full flexibility to the
client in which they can utilize the SDK according to their
software stack.

#### Returns

`void`

#### Defined in

[packages/core/src/SundaeSDK.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L74)
