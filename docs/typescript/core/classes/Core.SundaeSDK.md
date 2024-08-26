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

[packages/core/src/SundaeSDK.class.ts:70](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L70)

## Methods

### blaze

▸ **blaze**(): `undefined` \| `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\>

Helper method to retrieve a blaze instance.

#### Returns

`undefined` \| `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:250](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L250)

___

### builder

▸ **builder**(`contractVersion`): [`TxBuilderV1`](Core.TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:165](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L165)

▸ **builder**(`contractVersion`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:166](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L166)

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

[packages/core/src/SundaeSDK.class.ts:167](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L167)

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

[packages/core/src/SundaeSDK.class.ts:171](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L171)

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

[packages/core/src/SundaeSDK.class.ts:175](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L175)

▸ **builder**(): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:179](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L179)

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

[packages/core/src/SundaeSDK.class.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L180)

___

### getOptions

▸ **getOptions**(): [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L160)

___

### lucid

▸ **lucid**(): `undefined` \| `Lucid`

Helper method to retrieve a Lucid instance.

#### Returns

`undefined` \| `Lucid`

#### Defined in

[packages/core/src/SundaeSDK.class.ts:233](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L233)

___

### query

▸ **query**(): [`QueryProvider`](Core.QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](Core.QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:224](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L224)

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

[packages/core/src/SundaeSDK.class.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L89)
