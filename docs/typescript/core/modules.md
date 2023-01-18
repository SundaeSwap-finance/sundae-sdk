# @sundaeswap/sdk-core

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
import {
    SundaeSDK,
    ITxBuilderClass,
    TxBuilderLucid,
    ProviderSundaeSwap
} from "@sundae/sdk-core";

const txBuilder: ITxBuilderClass = new TxBuilderLucid(
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

const swap = sdk.swap( /** ... */ );
```

## Classes

- [AssetAmount](classes/AssetAmount.md)
- [SundaeSDK](classes/SundaeSDK.md)
- [SwapConfig](classes/SwapConfig.md)

## Extensions

- [ProviderSundaeSwap](classes/ProviderSundaeSwap.md)
- [TxBuilderLucid](classes/TxBuilderLucid.md)
- [ITxBuilderLucidOptions](interfaces/ITxBuilderLucidOptions.md)

## Extension Builders

- [TxBuilder](classes/TxBuilder.md)
- [IProviderClass](interfaces/IProviderClass.md)

## Interfaces

- [IAsset](interfaces/IAsset.md)
- [IBuildSwapArgs](interfaces/IBuildSwapArgs.md)
- [IPoolData](interfaces/IPoolData.md)
- [IPoolDataAsset](interfaces/IPoolDataAsset.md)
- [IPoolQuery](interfaces/IPoolQuery.md)
- [IProtocolParams](interfaces/IProtocolParams.md)
- [ISDKSwapArgs](interfaces/ISDKSwapArgs.md)
- [ITxBuilderComplete](interfaces/ITxBuilderComplete.md)
- [ITxBuilderOptions](interfaces/ITxBuilderOptions.md)

## Type Aliases

### CancelerAddress

Ƭ **CancelerAddress**: `string`

The optional alternate address that can cancel the Escrow order. This is
needed because a [DestinationAddress](modules.md#destinationaddress) can be a Script Address. This
is useful to chain swaps with other protocols if desired, while still allowing
a consistently authorized alternate to cancel the Escrow.

#### Defined in

[@types/txbuilder.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L66)

___

### Coin

Ƭ **Coin**: ``0`` \| ``1``

The boolean type of a pool's coin, where 0 = CoinA and 1 = CoinB.

#### Defined in

[@types/txbuilder.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L50)

___

### DatumHash

Ƭ **DatumHash**: `string`

The hash string of a Datum.

#### Defined in

[@types/txbuilder.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L40)

___

### DepositMixed

Ƭ **DepositMixed**: `Object`

The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
shifts after the order is placed but before it is scooped, the LP tokens along with
the remaining asset gets sent to the [DestinationAddress](modules.md#destinationaddress)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinAAmount` | [`AssetAmount`](classes/AssetAmount.md) |
| `CoinBAmount` | [`AssetAmount`](classes/AssetAmount.md) |

#### Defined in

[@types/txbuilder.ts:105](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L105)

___

### DepositSingle

Ƭ **DepositSingle**: `Object`

A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
receivable amount to satisfy a pool's CoinA/CoinB requirements.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `MinimumReceivable` | [`AssetAmount`](classes/AssetAmount.md) |
| `ZapDirection` | [`Coin`](modules.md#coin) |

#### Defined in

[@types/txbuilder.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L95)

___

### DestinationAddress

Ƭ **DestinationAddress**<`Data`\>: `Object`

Defines the destination address of a swap along with an optional datum hash to attach.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Data` | `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `datum?` | `Data` |

#### Defined in

[@types/txbuilder.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L55)

___

### EscrowAddress

Ƭ **EscrowAddress**: `Object`

An Escrow address defines the destination address and an optional PubKeyHash

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AlternateAddress?` | [`CancelerAddress`](modules.md#canceleraddress) |
| `DestinationAddress` | [`DestinationAddress`](modules.md#destinationaddress) |

#### Defined in

[@types/txbuilder.ts:71](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L71)

___

### Ident

Ƭ **Ident**: `string`

The unique identifier of a pool, defined as a string.

#### Defined in

[@types/txbuilder.ts:35](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L35)

___

### PubKeyHash

Ƭ **PubKeyHash**: `string`

A hex-encoded public key hash of an address.

#### Defined in

[@types/txbuilder.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L45)

___

### Swap

Ƭ **Swap**: `Object`

The swap direction of a [IAsset](interfaces/IAsset.md) coin pair, and a minimum receivable amount
which acts as the limit price of a swap.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinDirection` | [`Coin`](modules.md#coin) |
| `MinimumReceivable?` | [`AssetAmount`](classes/AssetAmount.md) |

#### Defined in

[@types/txbuilder.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L80)

___

### Withdraw

Ƭ **Withdraw**: [`AssetAmount`](classes/AssetAmount.md)

A withdraw defines the amount of LP tokens a holder wishes to burn in exchange
for their provided assets.

#### Defined in

[@types/txbuilder.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L89)

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
