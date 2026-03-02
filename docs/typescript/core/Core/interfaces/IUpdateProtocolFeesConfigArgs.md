[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IUpdateProtocolFeesConfigArgs

The arguments configuration for updating protocol fees on a Stableswaps pool.

## Extends

- [`IBaseConfig`](IBaseConfig.md)

## Properties

### poolUtxo

> **poolUtxo**: [`TUTXO`](../type-aliases/TUTXO.md)

The pool UTXO containing the current pool state.

#### Defined in

[packages/core/src/@types/configs.ts:239](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L239)

***

### protocolFees

> **protocolFees**: [`IFeesConfig`](IFeesConfig.md)

The new protocol fees to set on the pool.

#### Defined in

[packages/core/src/@types/configs.ts:244](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L244)

***

### signers?

> `optional` **signers**: `string`[]

Optional signers to attach to the transaction (e.g., fee manager keys).

#### Defined in

[packages/core/src/@types/configs.ts:249](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L249)
