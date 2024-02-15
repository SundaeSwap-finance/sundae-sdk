# Class: QueryProviderSundaeSwap

[Core](../modules/Core.md).QueryProviderSundaeSwap

This class provides a simple set of useful tooling, but primarily is used to
query data about pools on the SundaeSwap protocol.

**`Example`**

```ts
const query = new QueryProviderSundaeSwap("preview");
const { ident } = await query.findPoolData({
  ident: "02"
});

console.log(ident); // "02"
```

## Implements

- [`QueryProvider`](Core.QueryProvider.md)

## Methods

### getProtocolBlueprints

▸ **getProtocolBlueprints**(`version`): `Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/Core.ISundaeProtocolParamsFull.md)[]\>

Retrieves the script hashes for all available Protocols.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `version` | `undefined` | The protocol script hashes. |

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/Core.ISundaeProtocolParamsFull.md)[]\>

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:269](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L269)

___

### getProtocolScriptHashes

▸ **getProtocolScriptHashes**(`version`): `Promise`\<[`ISundaeProtocolParams`](../interfaces/Core.ISundaeProtocolParams.md)[]\>

Retrieves the script hashes for all available Protocols.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `version` | `undefined` | The protocol script hashes. |

#### Returns

`Promise`\<[`ISundaeProtocolParams`](../interfaces/Core.ISundaeProtocolParams.md)[]\>

#### Defined in

[packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:214](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts#L214)
