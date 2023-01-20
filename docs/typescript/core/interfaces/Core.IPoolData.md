# Interface: IPoolData

[Core](../modules/Core.md).IPoolData

Pool data that is returned from [findPoolData](Core.IQueryProviderClass.md#findpooldata).

## Properties

### assetA

• **assetA**: [`IPoolDataAsset`](Core.IPoolDataAsset.md)

Asset data for the pool pair, Asset A

#### Defined in

[@types/queryprovider.ts:71](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L71)

___

### assetB

• **assetB**: [`IPoolDataAsset`](Core.IPoolDataAsset.md)

Asset data for the pool pair, Asset B

#### Defined in

[@types/queryprovider.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L73)

___

### fee

• **fee**: `string`

The pool fee represented as a string. i.e. 1% === "1" and .03% === "0.03"

#### Defined in

[@types/queryprovider.ts:67](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L67)

___

### ident

• **ident**: `string`

The unique identifier of the pool. Also returned directly via [findPoolIdent](Core.IQueryProviderClass.md#findpoolident)

#### Defined in

[@types/queryprovider.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L69)

___

### quantityA

• **quantityA**: `string`

The pool quantity of [assetA](Core.IPoolData.md#asseta)

#### Defined in

[@types/queryprovider.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L75)

___

### quantityB

• **quantityB**: `string`

The pool quantity of [assetB](Core.IPoolData.md#assetb)

#### Defined in

[@types/queryprovider.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L77)
