---
title: "IQueryProviderClass"
---

# IQueryProviderClass

The base Provider interface by which you can implement custom Provider classes.

## Properties

### findOpenOrderDatum

> `Function`

#### Type declaration

Finds the associated UTXO data of an open order.

##### Signature

```ts
(utxo: UTXO): Promise<{
    datum: string;
    datumHash: string;
}>;
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utxo` | [`UTXO`](../types/UTXO.md) | The transaction hash and index of the open order in the escrow contract. |

##### Returns

`Promise`\<{
    `datum`: `string`;
    `datumHash`: `string`;
}\>

Defined in:  [@types/queryprovider.ts:34](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L34)

### findPoolData

> `Function`

#### Type declaration

Finds a matching pool on the SundaeSwap protocol.

##### Signature

```ts
(query: IPoolQuery): Promise<IPoolData>;
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](IPoolQuery.md) |

##### Returns

`Promise`\<[`IPoolData`](IPoolData.md)\>

Defined in:  [@types/queryprovider.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L19)

### findPoolIdent

> `Function`

#### Type declaration

Finds a matching pool on the SundaeSwap protocol and returns only the ident.

##### Signature

```ts
(query: IPoolQuery): Promise<string>;
```

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`IPoolQuery`](IPoolQuery.md) |

##### Returns

`Promise`\<`string`\>

Defined in:  [@types/queryprovider.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L27)
