[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: `abstract` QueryProvider

The base Provider interface by which you can implement custom Provider classes.

## Properties

### findOpenOrderDatum()

> `abstract` **findOpenOrderDatum**: (`utxo`) => `Promise`\<`object`\>

Finds the associated UTXO data of an open order.

#### Parameters

• **utxo**: [`TUTXO`](../type-aliases/TUTXO.md)

The transaction hash and index of the open order in the escrow contract.

#### Returns

`Promise`\<`object`\>

##### datum

> **datum**: `string`

##### datumHash

> **datumHash**: `string`

#### Defined in

[packages/core/src/Abstracts/QueryProvider.abstract.class.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/QueryProvider.abstract.class.ts#L26)

***

### findPoolData()

> `abstract` **findPoolData**: (`query`) => `Promise`\<[`IPoolData`](../interfaces/IPoolData.md) \| [`IPoolData`](../interfaces/IPoolData.md)[]\>

Finds a matching pool on the SundaeSwap protocol.

#### Parameters

• **query**: `any`

The query object as defined by the implementing class.

#### Returns

`Promise`\<[`IPoolData`](../interfaces/IPoolData.md) \| [`IPoolData`](../interfaces/IPoolData.md)[]\>

Returns the queried pool's data.

#### Defined in

[packages/core/src/Abstracts/QueryProvider.abstract.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Abstracts/QueryProvider.abstract.class.ts#L19)
