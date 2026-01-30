[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IDatumBuilderMintStablePoolArgsV2

Arguments interface for minting a Stableswaps V2 pool, extending the V1 args
with V2-specific parameters for configurable fee precision and token prescaling.

## Extends

- [`IDatumBuilderMintStablePoolArgs`](IDatumBuilderMintStablePoolArgs.md)

## Properties

### feeDenominator?

> `optional` **feeDenominator**: `bigint`

The fee denominator for calculating fees. Defaults to 10,000 (basis points).
Higher values allow for finer fee precision.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts#L45)

***

### linearAmplification

> **linearAmplification**: `bigint`

The linear amplification factor that determines the curve characteristics of the Stableswaps pool.
Higher values make the pool behave more like a constant sum pool (better for stable pairs),
while lower values make it behave more like a constant product pool.

#### Inherited from

[`IDatumBuilderMintStablePoolArgs`](IDatumBuilderMintStablePoolArgs.md).[`linearAmplification`](IDatumBuilderMintStablePoolArgs.md#linearamplification)

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts#L30)

***

### prescale?

> `optional` **prescale**: [`bigint`, `bigint`]

Prescale factors for normalizing tokens with different decimals.
[prescaleA, prescaleB] - reserves are multiplied by these before invariant calculations.
Defaults to [1n, 1n] (no scaling).

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts#L52)

***

### protocolFees

> **protocolFees**: [`IFeesConfig`](IFeesConfig.md)

Protocol fee configuration for the Stableswaps pool, including bid and ask fees.

#### Inherited from

[`IDatumBuilderMintStablePoolArgs`](IDatumBuilderMintStablePoolArgs.md).[`protocolFees`](IDatumBuilderMintStablePoolArgs.md#protocolfees)

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts:23](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts#L23)
