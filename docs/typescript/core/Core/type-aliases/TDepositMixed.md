[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TDepositMixed

> **TDepositMixed**: `object`

The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
shifts after the order is placed but before it is scooped, the LP tokens along with
the remaining asset gets sent to the [TDestinationAddress](TDestinationAddress.md)

## Type declaration

### CoinAAmount

> **CoinAAmount**: `AssetAmount`

### CoinBAmount

> **CoinBAmount**: `AssetAmount`

## Defined in

[packages/core/src/@types/datumbuilder.ts:159](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L159)
