# Class: SundaeSDK

A description for the SundaeSDK class.

```ts
const sdk = new SundaeSDK(
 new ProviderSundaeSwap()
);
```

## Constructors

### constructor

• **new SundaeSDK**(`builder`)

You'll need to provide a TxBuilder class to the main SDK, which is used to build Transactions and submit them.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `builder` | [`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<`Object`, `unknown`, `unknown`, `unknown`\> | An instance of TxBuilder. |

#### Defined in

[classes/SundaeSDK.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/d486512/packages/core/src/classes/SundaeSDK.class.ts#L19)

## Properties

### builder

• `Private` **builder**: [`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<`Object`, `unknown`, `unknown`, `unknown`\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/d486512/packages/core/src/classes/SundaeSDK.class.ts#L19)
