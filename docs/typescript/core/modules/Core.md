# Module: Core

# Introduction
The `@sundae/sdk-core` package serves as the foundation for interacting with the SundaeSwap protocol in a predictable and declarative manner,
and includes all typings and class interfaces needed to both [Get Started](#get-started) and extending the API.

## Get Started
To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:

```sh
yarn add lucid-cardano @sundae/sdk-core
```

Next, configure the instance in your app:

```ts
import { SundaeSDK } from "@sundae/sdk-core";
import {
 TxBuilderLucid,
 ProviderSundaeSwap
} from "@sundae/sdk-core/extensions";

const txBuilder = new TxBuilderLucid(
    {
        provider: "blockfrost",
        blockfrost: {
            url: "https://cardano-preview.blockfrost.io/api/v0",
            apiKey: "YOUR_API_KEY"
        }
    },
    new ProviderSundaeSwap("preview")
)

const sdk: SundaeSDK = new SundaeSDK(txBuilder);

const swap = await sdk.swap( /** ... */ ).then(({ submit }) => submit());
```

## Enumerations

- [PoolCoin](../enums/Core.PoolCoin.md)

## Classes

- [AssetAmount](../classes/Core.AssetAmount.md)
- [DatumBuilder](../classes/Core.DatumBuilder.md)
- [DepositConfig](../classes/Core.DepositConfig.md)
- [SundaeSDK](../classes/Core.SundaeSDK.md)
- [SwapConfig](../classes/Core.SwapConfig.md)
- [Transaction](../classes/Core.Transaction.md)

## Exported TxBuilders

- [TxBuilder](../classes/Core.TxBuilder.md)

## Interfaces

- [Arguments](../interfaces/Core.Arguments.md)
- [BuildDepositConfigArgs](../interfaces/Core.BuildDepositConfigArgs.md)
- [BuildSwapConfigArgs](../interfaces/Core.BuildSwapConfigArgs.md)
- [DatumResult](../interfaces/Core.DatumResult.md)
- [DepositArguments](../interfaces/Core.DepositArguments.md)
- [IAsset](../interfaces/Core.IAsset.md)
- [IDepositArgs](../interfaces/Core.IDepositArgs.md)
- [IOrderArgs](../interfaces/Core.IOrderArgs.md)
- [IPoolData](../interfaces/Core.IPoolData.md)
- [IPoolDataAsset](../interfaces/Core.IPoolDataAsset.md)
- [IPoolQuery](../interfaces/Core.IPoolQuery.md)
- [IProtocolParams](../interfaces/Core.IProtocolParams.md)
- [ISwapArgs](../interfaces/Core.ISwapArgs.md)
- [ITxBuilderBaseOptions](../interfaces/Core.ITxBuilderBaseOptions.md)
- [ITxBuilderComplete](../interfaces/Core.ITxBuilderComplete.md)
- [SwapArguments](../interfaces/Core.SwapArguments.md)

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

[@types/datumbuilder.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L41)

___

### DatumHash

Ƭ **DatumHash**: `string`

The hash string of a Datum.

#### Defined in

[@types/datumbuilder.ts:12](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L12)

___

### DepositMixed

Ƭ **DepositMixed**: `Object`

The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
shifts after the order is placed but before it is scooped, the LP tokens along with
the remaining asset gets sent to the [DestinationAddress](Core.md#destinationaddress)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinAAmount` | [`AssetAmount`](../classes/Core.AssetAmount.md) |
| `CoinBAmount` | [`AssetAmount`](../classes/Core.AssetAmount.md) |

#### Defined in

[@types/datumbuilder.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L80)

___

### DepositSingle

Ƭ **DepositSingle**: `Object`

A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
receivable amount to satisfy a pool's CoinA/CoinB requirements.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `MinimumReceivable` | [`AssetAmount`](../classes/Core.AssetAmount.md) |
| `ZapDirection` | [`PoolCoin`](../enums/Core.PoolCoin.md) |

#### Defined in

[@types/datumbuilder.ts:70](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L70)

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

[@types/datumbuilder.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L30)

___

### Ident

Ƭ **Ident**: `string`

The unique identifier of a pool, defined as a string.

#### Defined in

[@types/datumbuilder.ts:7](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L7)

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

[@types/datumbuilder.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L46)

___

### PubKeyHash

Ƭ **PubKeyHash**: `string`

A hex-encoded public key hash of an address.

#### Defined in

[@types/datumbuilder.ts:17](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L17)

___

### Swap

Ƭ **Swap**: `Object`

The swap direction of a [IAsset](../interfaces/Core.IAsset.md) coin pair, and a minimum receivable amount
which acts as the limit price of a swap.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `MinimumReceivable?` | [`AssetAmount`](../classes/Core.AssetAmount.md) |
| `SuppliedCoin` | [`PoolCoin`](../enums/Core.PoolCoin.md) |

#### Defined in

[@types/datumbuilder.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L55)

___

### Withdraw

Ƭ **Withdraw**: [`AssetAmount`](../classes/Core.AssetAmount.md)

A withdraw defines the amount of LP tokens a holder wishes to burn in exchange
for their provided assets.

#### Defined in

[@types/datumbuilder.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L64)

## Utility Types

### TSupportedNetworks

Ƭ **TSupportedNetworks**: ``"mainnet"`` \| ``"preview"``

A type constant used for determining valid Cardano Network values.

#### Defined in

[@types/utilities.ts:20](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L20)

___

### TSupportedWallets

Ƭ **TSupportedWallets**: ``"nami"`` \| ``"eternl"`` \| ``"typhoncip30"`` \| ``"ccvault"`` \| ``"typhon"`` \| ``"yoroi"`` \| ``"flint"`` \| ``"gerowallet"`` \| ``"cardwallet"`` \| ``"nufi"`` \| ``"begin"``

A type constant used for determining valid CIP-30 compliant Web3 Wallets for Cardano.

#### Defined in

[@types/utilities.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L27)
