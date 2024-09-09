# Class: SundaeSDK

[Core](../modules/Core.md).SundaeSDK

The main SundaeSDK class that contains all the necessary sub-classes for
interacting with the SundaeSwap protocol.

```ts
const sdk = await SundaeSDK.new({
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

[packages/core/src/SundaeSDK.class.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L64)

## Methods

### blaze

▸ **blaze**(): `undefined` \| `Blaze`\<`Provider`, `Wallet$1`\>

Helper method to retrieve a blaze instance.

#### Returns

`undefined` \| `Blaze`\<`Provider`, `Wallet$1`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:269](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L269)

___

### builder

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderBlazeV1`](Blaze.TxBuilderBlazeV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |
| `txBuilderType` | [`BLAZE`](../enums/Core.ETxBuilderType.md#blaze) |

#### Returns

[`TxBuilderBlazeV1`](Blaze.TxBuilderBlazeV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:168](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L168)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType` | [`BLAZE`](../enums/Core.ETxBuilderType.md#blaze) |

#### Returns

[`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L172)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |
| `txBuilderType` | [`LUCID`](../enums/Core.ETxBuilderType.md#lucid) |

#### Returns

[`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:176](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L176)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType` | [`LUCID`](../enums/Core.ETxBuilderType.md#lucid) |

#### Returns

[`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L180)

▸ **builder**(`contractVersion`): [`TxBuilderV1`](Core.TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:184](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L184)

▸ **builder**(`contractVersion`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:185](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L185)

▸ **builder**(`contractVersion`, `txBuilderType?`): [`TxBuilderV1`](Core.TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |
| `txBuilderType?` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:186](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L186)

▸ **builder**(`contractVersion`, `txBuilderType?`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType?` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:190](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L190)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:194](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L194)

▸ **builder**(): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:198](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L198)

▸ **builder**(`contractVersion?`, `txBuilderType?`): [`TxBuilderV1`](Core.TxBuilderV1.md) \| [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion?` | [`EContractVersion`](../enums/Core.EContractVersion.md) |
| `txBuilderType?` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md) \| [`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:199](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L199)

___

### getOptions

▸ **getOptions**(): [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:163](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L163)

___

### lucid

▸ **lucid**(): `undefined` \| `Lucid`

Helper method to retrieve a Lucid instance.

#### Returns

`undefined` \| `Lucid`

#### Defined in

[packages/core/src/SundaeSDK.class.ts:252](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L252)

___

### query

▸ **query**(): [`QueryProvider`](Core.QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](Core.QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:243](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L243)

___

### registerTxBuilders

▸ **registerTxBuilders**(): `Promise`\<`void`\>

Registers TxBuilders depending on the TxBuilder
type. Currently we only support Lucid, but plan on adding
more types in the future. This gives full flexibility to the
client in which they can utilize the SDK according to their
software stack.

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L93)

___

### new

▸ **new**(`args`): `Promise`\<[`SundaeSDK`](Core.SundaeSDK.md)\>

Sets up TxBuilders based on the selected builder type. This is async
because we only import them after consuming the arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md) | The SundaeSDK arguments. |

#### Returns

`Promise`\<[`SundaeSDK`](Core.SundaeSDK.md)\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L80)
