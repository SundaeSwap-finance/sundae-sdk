# Module: Core

# Introduction
The `@sundaeswap/sdk-core` package serves as the foundation for interacting with the SundaeSwap protocol in a predictable and declarative manner,
and includes all typings and class interfaces needed to both [Get Started](#get-started) and extending the API.

## Get Started
To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:

```sh
yarn add lucid-cardano @sundaeswap/sdk-core
```

If you plan to use this package in the browser along with Webpack 5, you'll need to add
polyfill support for Buffer. You can do this like so:

```ts
plugins: {
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"]
  })
}
```

Next, configure the instance in your app:

```ts
import { SundaeSDK } from "@sundaeswap/sdk-core";
import {
 TxBuilderLucid,
 ProviderSundaeSwap
} from "@sundaeswap/sdk-core/extensions";

const txBuilder = new TxBuilderLucid(
 {
     wallet: "eternl",
     network: "preview",        
     provider: "blockfrost",
     blockfrost: {
         url: "https://cardano-preview.blockfrost.io/api/v0",
         apiKey: "YOUR_API_KEY"
     }
 },
 new ProviderSundaeSwap("preview")
);

const sdk: SundaeSDK = new SundaeSDK(txBuilder);

const txHash = await sdk.swap( /** ... */ ).then(({ submit }) => submit());
```

## Enumerations

- [PoolCoin](../enums/Core.PoolCoin.md)

## Classes

- [CancelConfig](../classes/Core.CancelConfig.md)
- [DatumBuilder](../classes/Core.DatumBuilder.md)
- [DepositConfig](../classes/Core.DepositConfig.md)
- [FreezerConfig](../classes/Core.FreezerConfig.md)
- [SundaeSDK](../classes/Core.SundaeSDK.md)
- [SwapConfig](../classes/Core.SwapConfig.md)
- [Transaction](../classes/Core.Transaction.md)
- [WithdrawConfig](../classes/Core.WithdrawConfig.md)
- [ZapConfig](../classes/Core.ZapConfig.md)

## Exported TxBuilders

- [TxBuilder](../classes/Core.TxBuilder.md)

## Interfaces

- [Arguments](../interfaces/Core.Arguments.md)
- [BaseConfig](../interfaces/Core.BaseConfig.md)
- [CancelConfigArgs](../interfaces/Core.CancelConfigArgs.md)
- [DatumResult](../interfaces/Core.DatumResult.md)
- [DepositArguments](../interfaces/Core.DepositArguments.md)
- [DepositConfigArgs](../interfaces/Core.DepositConfigArgs.md)
- [FreezerConfigArgs](../interfaces/Core.FreezerConfigArgs.md)
- [IPoolData](../interfaces/Core.IPoolData.md)
- [IPoolDataAsset](../interfaces/Core.IPoolDataAsset.md)
- [IPoolQuery](../interfaces/Core.IPoolQuery.md)
- [IProtocolParams](../interfaces/Core.IProtocolParams.md)
- [ITxBuilderBaseOptions](../interfaces/Core.ITxBuilderBaseOptions.md)
- [ITxBuilderComplete](../interfaces/Core.ITxBuilderComplete.md)
- [ITxBuilderFees](../interfaces/Core.ITxBuilderFees.md)
- [ITxBuilderReferralFee](../interfaces/Core.ITxBuilderReferralFee.md)
- [ITxBuilderTx](../interfaces/Core.ITxBuilderTx.md)
- [LockArguments](../interfaces/Core.LockArguments.md)
- [OrderConfigArgs](../interfaces/Core.OrderConfigArgs.md)
- [SwapArguments](../interfaces/Core.SwapArguments.md)
- [SwapConfigArgs](../interfaces/Core.SwapConfigArgs.md)
- [WithdrawArguments](../interfaces/Core.WithdrawArguments.md)
- [WithdrawConfigArgs](../interfaces/Core.WithdrawConfigArgs.md)
- [ZapArguments](../interfaces/Core.ZapArguments.md)
- [ZapConfigArgs](../interfaces/Core.ZapConfigArgs.md)

## Extension Builders

- [IQueryProviderClass](../interfaces/Core.IQueryProviderClass.md)

## Type Aliases

### CancelerAddress

Ƭ **CancelerAddress**: `string`

The optional alternate address that can cancel the Escrow order. This is
needed because a [DestinationAddress](Core.md#destinationaddress) can be a Script Address. This
is useful to chain swaps with other protocols if desired, while still allowing
a consistently authorized alternate to cancel the Escrow.

#### Defined in

[@types/datumbuilder.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L50)

___

### DatumHash

Ƭ **DatumHash**: `string`

The hash string of a Datum.

#### Defined in

[@types/datumbuilder.ts:21](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L21)

___

### DelegationProgramPools

Ƭ **DelegationProgramPools**: `Map`<`string`, `bigint`\>

A map of pools with their associated weight.

#### Defined in

[@types/configs.ts:67](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L67)

___

### DelegationPrograms

Ƭ **DelegationPrograms**: `Map`<`string`, [`DelegationProgramPools`](Core.md#delegationprogrampools)\>

A map of programs with their associated [DelegationProgramPools](Core.md#delegationprogrampools) map.

#### Defined in

[@types/configs.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L69)

___

### DepositMixed

Ƭ **DepositMixed**: `Object`

The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
shifts after the order is placed but before it is scooped, the LP tokens along with
the remaining asset gets sent to the [DestinationAddress](Core.md#destinationaddress)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinAAmount` | `AssetAmount` |
| `CoinBAmount` | `AssetAmount` |

#### Defined in

[@types/datumbuilder.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L89)

___

### DepositSingle

Ƭ **DepositSingle**: `Object`

A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
receivable amount to satisfy a pool's CoinA/CoinB requirements.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinAmount` | `AssetAmount` |
| `ZapDirection` | [`PoolCoin`](../enums/Core.PoolCoin.md) |

#### Defined in

[@types/datumbuilder.ts:79](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L79)

___

### DestinationAddress

Ƭ **DestinationAddress**: `Object`

Defines the destination address of a swap along with an optional datum hash to attach.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `datumHash?` | `string` |

#### Defined in

[@types/datumbuilder.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L39)

___

### Ident

Ƭ **Ident**: `string`

The unique identifier of a pool, defined as a string.

#### Defined in

[@types/datumbuilder.ts:8](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L8)

___

### OrderAddresses

Ƭ **OrderAddresses**: `Object`

An Escrow address defines the destination address and an optional PubKeyHash

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AlternateAddress?` | [`CancelerAddress`](Core.md#canceleraddress) |
| `DestinationAddress` | [`DestinationAddress`](Core.md#destinationaddress) |

#### Defined in

[@types/datumbuilder.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L55)

___

### PubKeyHash

Ƭ **PubKeyHash**: `string`

A hex-encoded public key hash of an address.

#### Defined in

[@types/datumbuilder.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L26)

___

### Swap

Ƭ **Swap**: `Object`

The swap direction of a coin pair, and a minimum receivable amount
which acts as the limit price of a swap.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `MinimumReceivable?` | `AssetAmount` |
| `SuppliedCoin` | [`PoolCoin`](../enums/Core.PoolCoin.md) |

#### Defined in

[@types/datumbuilder.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L64)

___

### UTXO

Ƭ **UTXO**: `Object`

The structure for a UTXO.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | `string` |
| `index` | `number` |

#### Defined in

[@types/datumbuilder.ts:13](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L13)

___

### Withdraw

Ƭ **Withdraw**: `AssetAmount`

A withdraw defines the amount of LP tokens a holder wishes to burn in exchange
for their provided assets.

#### Defined in

[@types/datumbuilder.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L73)

## Utility Types

### TSupportedNetworks

Ƭ **TSupportedNetworks**: ``"mainnet"`` \| ``"preview"``

A type constant used for determining valid Cardano Network values.

#### Defined in

[@types/utilities.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L30)

___

### TSupportedWallets

Ƭ **TSupportedWallets**: ``"nami"`` \| ``"eternl"`` \| ``"typhoncip30"`` \| ``"ccvault"`` \| ``"typhon"`` \| ``"yoroi"`` \| ``"flint"`` \| ``"gerowallet"`` \| ``"cardwallet"`` \| ``"nufi"`` \| ``"begin"``

A type constant used for determining valid CIP-30 compliant Web3 Wallets for Cardano.

#### Defined in

[@types/utilities.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L37)
