[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: DatumBuilderV4

Datum + redeemer builder for sundae-v4 transactions.

Unlike v1/v3 — where one Order datum shape served the whole protocol — v4
splits intent into a list of `(module_hash, data)` constraints attached to a
generic `OrderDatum`. This class encodes the authoritative, blueprint-backed
pieces of that datum: the `owner` multisig, the `destination`, asset classes,
and the surrounding `OrderDatum` shell.

The per-constraint `data` payloads are opaque `Data` on-chain (decoded by
each withdraw module, not described by the blueprint). This class encodes the
ones the SDK builds — `buildSwapConstraintData`, `buildBasicConstraintData`,
`buildStrategyConstraintData` — plus the module Create configs for pool
creation. Payloads for modules the SDK doesn't model remain caller-supplied.

## Implements

- [`DatumBuilderAbstract`](DatumBuilderAbstract.md)

## Properties

### network

> **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:72](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L72)

***

### CIP68\_100

> `readonly` `static` **CIP68\_100**: `"000643b0"` = `"000643b0"`

CIP-68 asset-name prefixes used by the v4 pool-mint policy.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:436](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L436)

## Methods

### buildAssetClassDatum()

> **buildAssetClassDatum**(`asset`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Builds a v4 `AssetClass` (`{ policy, name }`) from an SDK asset. ADA is
canonicalised to the empty policy / empty name.

#### Parameters

• **asset**: `AssetAmount`\<`IAssetAmountMetadata`\>

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

##### name

> **name**: `string`

##### policy

> **policy**: `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:234](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L234)

***

### buildBasicConstraintData()

> **buildBasicConstraintData**(`__namedParameters`): `PlutusData`

Builds the constraint `data` for a **basic** order — `Deposit`, `Withdraw`,
or `Claim`. All three share the same field shape and are distinguished by
their constructor index (verified against the CLI's `plutusBasicConstraints`):
```
Deposit  = Constr 0 [offered: List<(AssetClass, Int)>, min_received: List<(AssetClass, Int)>]
Withdraw = Constr 1 [ …same… ]
Claim    = Constr 3 [ …same… ]
```

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **\_\_namedParameters.offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **\_\_namedParameters.type**: [`EV4BasicConstraint`](../enumerations/EV4BasicConstraint.md)

#### Returns

`PlutusData`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:301](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L301)

***

### buildConstantSumConfigDatum()

> **buildConstantSumConfigDatum**(`__namedParameters`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Builds a `ConstantSumConfig` — the config for a constant-sum pool module.
`prices` are the per-asset weights; `fee`/`bountyK` are `Rational`
fractions; `waiveFeeOnClaim` toggles the tag-claim bounty fee waiver.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.bountyK?** = `...`

• **\_\_namedParameters.bountyK.den**: `bigint`

• **\_\_namedParameters.bountyK.num**: `bigint`

• **\_\_namedParameters.fee**

• **\_\_namedParameters.fee.den**: `bigint`

• **\_\_namedParameters.fee.num**: `bigint`

• **\_\_namedParameters.prices**: `bigint`[]

• **\_\_namedParameters.waiveFeeOnClaim?**: `boolean` = `false`

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

##### bounty\_k

> **bounty\_k**: `object`

##### bounty\_k.den

> **den**: `bigint`

##### bounty\_k.num

> **num**: `bigint`

##### fee

> **fee**: `object`

##### fee.den

> **den**: `bigint`

##### fee.num

> **num**: `bigint`

##### prices

> **prices**: `bigint`[]

##### waive\_fee\_on\_claim

> **waive\_fee\_on\_claim**: `boolean`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:324](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L324)

***

### buildDestinationAddresses()

> **buildDestinationAddresses**(`__namedParameters`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`"Self"` \| `object`\>

Builds a `Fixed` destination — a concrete address plus an optional inline
datum to attach to the payout. v4 destinations carry an `Option<Data>`
datum (no datum-hash variant), so a `HASH` datum type is rejected.

#### Parameters

• **\_\_namedParameters**: [`TDestinationAddress`](../type-aliases/TDestinationAddress.md)

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`"Self"` \| `object`\>

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L151)

***

### buildFeeSplitConfigDatum()

> **buildFeeSplitConfigDatum**(`__namedParameters`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Builds a `FeeSplitConfig` — the config for the fee-split module carried by
every v4 pool. `protocolShare` is the protocol's `Rational` cut of fees.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.protocolShare**

• **\_\_namedParameters.protocolShare.den**: `bigint`

• **\_\_namedParameters.protocolShare.num**: `bigint`

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

##### protocol\_share

> **protocol\_share**: `object`

##### protocol\_share.den

> **den**: `bigint`

##### protocol\_share.num

> **num**: `bigint`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:381](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L381)

***

### buildGovernanceConfigDatum()

> **buildGovernanceConfigDatum**(`__namedParameters`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`PlutusData`\>

Builds a `GovernanceConfig` (`Constr 0 [admin, delay, None]`) for the
governance module, when a pool's settings authorise an upgrade action.
`admin` is a bech32 address (resolved to a `Signature`/`Script` multisig);
`delayMs` is the upgrade timelock. `pending` is always `None` at creation.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.admin**: `string`

• **\_\_namedParameters.delayMs**: `bigint`

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`PlutusData`\>

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:397](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L397)

***

### buildOrderDatum()

> **buildOrderDatum**(`__namedParameters`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Assembles the v4 `OrderDatum` shell from its parts. Every non-strategy
order placement ultimately produces one of these.

#### Parameters

• **\_\_namedParameters**: [`IDatumBuilderV4OrderArgs`](../interfaces/IDatumBuilderV4OrderArgs.md)

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

##### budget

> **budget**: `bigint`

##### config\_token

> **config\_token**: `string`

##### constraints

> **constraints**: [`string`, `PlutusData`][]

##### destination

> **destination**: `"Self"` \| `object`

##### extension

> **extension**: `PlutusData`

##### owner

> **owner**: `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### share\_batcher

> **share\_batcher**: `bigint`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:82](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L82)

***

### buildOwnerDatum()

> **buildOwnerDatum**(`main`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`\>

Builds the `owner` multisig for an order from a bech32 address. A script
address becomes a `Script` owner; otherwise a single `Signature` owner
keyed on the staking hash if present, else the payment hash (mirroring the
v3 convention). Richer multisig shapes (`AtLeast`, `AllOf`, …) can be
supplied directly to [buildOrderDatum](DatumBuilderV4.md#buildorderdatum) as a `MultisigScript`.

#### Parameters

• **main**: `string`

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`\>

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:128](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L128)

***

### buildPoolDatum()

> **buildPoolDatum**(`__namedParameters`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Builds a `PoolDatum` for a v4 pool. The `moduleState` entries pair a module
hash with its config-commitment: use [DatumBuilderV4.hashModuleConfig](DatumBuilderV4.md#hashmoduleconfig)
on the module's serialized config (e.g. the CS config), or the sentinel
`"80"` (CBOR empty) for config-less modules like fairness.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.actions**: `object`[]

• **\_\_namedParameters.assets**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **\_\_namedParameters.circulatingLp**: `bigint`

• **\_\_namedParameters.identifier**: `string`

• **\_\_namedParameters.moduleState**: [`string`, `string`][]

• **\_\_namedParameters.premintedLp**: `bigint`

• **\_\_namedParameters.totalLp**: `bigint`

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

##### actions

> **actions**: `object`[]

##### assets

> **assets**: [`object`, `bigint`][]

##### circulating\_lp

> **circulating\_lp**: `bigint`

##### identifier

> **identifier**: `string`

##### module\_state

> **module\_state**: [`string`, `string`][]

##### preminted\_lp

> **preminted\_lp**: `bigint`

##### total\_lp

> **total\_lp**: `bigint`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:500](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L500)

***

### buildSelfDestination()

> **buildSelfDestination**(): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`"Self"` \| `object`\>

Builds the `Self` destination, which re-locks the order's payout at the
order address itself (used by multi-step / routed intents).

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`"Self"` \| `object`\>

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:219](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L219)

***

### buildStrategyConstraintData()

> **buildStrategyConstraintData**(`__namedParameters`): `PlutusData`

Builds the constraint `data` for a **strategy** order — the payload keyed
under the strategy-order constraint module hash. It names the party
authorized to sign executions (`auth`) and the allowed final payout
destinations an execution may route to.

```
StrategyConstraints = Constr 0 [
  auth: MultisigScript,
  final_destinations: List<Destination>,
]
```

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.auth**: `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

• **\_\_namedParameters.finalDestinations**: (`"Self"` \| `object`)[]

#### Returns

`PlutusData`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:363](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L363)

***

### buildSwapConstraintData()

> **buildSwapConstraintData**(`__namedParameters`): `PlutusData`

Builds the constraint `data` for a **swap** order — the payload keyed under
the swap-order constraint module hash in [IDatumBuilderV4OrderArgs](../interfaces/IDatumBuilderV4OrderArgs.md)'s
`constraints`. This is a partial-fill-capable order: `originalOffered` is
the immutable quote reference and `remainingOffered` shrinks as fills land.

Encoding (constructor index **2**, verified against the sundae-v4 CLI's
`plutusSwapConstraints`):
```
Swap = Constr 2 [
  offered: AssetClass,                 // Constr 0 [policy, name]
  original_offered: Int,
  remaining_offered: Int,
  min_received: List<(AssetClass, Int)> // each pair is a 2-elem list
]
```

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **\_\_namedParameters.offered**: `AssetAmount`\<`IAssetAmountMetadata`\>

• **\_\_namedParameters.originalOffered**: `bigint`

• **\_\_namedParameters.remainingOffered**: `bigint`

#### Returns

`PlutusData`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:269](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L269)

***

### buildCreatePoolMintRedeemer()

> `static` **buildCreatePoolMintRedeemer**(`__namedParameters`): `PlutusData`

The pool-mint `CreatePool` redeemer:
`Constr 0 [OutputReference(Constr 0 [txId, index]), settings_ref_index]`.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.seedIndex**: `number`

• **\_\_namedParameters.seedTxHash**: `string`

• **\_\_namedParameters.settingsRefIndex**: `number`

#### Returns

`PlutusData`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:457](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L457)

***

### buildModuleCreateRedeemer()

> `static` **buildModuleCreateRedeemer**(`config`?): `PlutusData`

A module's `Create` redeemer: `Constr 0 [config]` — used at pool creation
to validate each module's initial `module_state` commitment. Pass the
module's config `PlutusData`, or omit it for a config-less module (e.g.
fairness, whose `Create` is the nullary `Constr 0 []`).

#### Parameters

• **config?**: `PlutusData`

#### Returns

`PlutusData`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:486](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L486)

***

### buildVoidData()

> `static` **buildVoidData**(): `PlutusData`

The canonical `Void` datum (`d87980`) — a constructor-0 value with no
fields, used as the default order `extension`.

#### Returns

`PlutusData`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:601](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L601)

***

### cip68Names()

> `static` **cip68Names**(`ident`): `object`

The `100`/`222`/`333` CIP-68 asset names for a pool identifier.

#### Parameters

• **ident**: `string`

#### Returns

`object`

##### lp

> **lp**: `string`

##### nft

> **nft**: `string`

##### ref

> **ref**: `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:441](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L441)

***

### computePoolIdent()

> `static` **computePoolIdent**(`seedTxHash`, `seedIndex`): `string`

Computes a pool's `identifier`: `blake2b_256` of the CBOR of the seed
UTxO's `OutputReference` (`Constr 0 [txId, index]`), truncated to 28 bytes.
Must byte-match the pool-mint validator's `cbor.serialise(seed_utxo)`.

#### Parameters

• **seedTxHash**: `string`

• **seedIndex**: `number`

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:425](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L425)

***

### getSignerKeyFromDatum()

> `static` **getSignerKeyFromDatum**(`datum`): `undefined` \| `string`

Extracts the owner's **required-signer key hash** from a v4 order datum's
`owner` multisig, for building a Cancel/Update transaction. Only a single
`Signature` owner reduces to one required signer — it yields its key hash.
Every other shape (`Script`, `AllOf`, `AnyOf`, `AtLeast`, `Before`,
`After`) returns `undefined`: a script hash is **not** an Ed25519 key hash
(adding it as a required signer would make an unsignable tx), and richer
multisigs can't be reduced to one signer. The caller must attach the
appropriate witness (native/plutus script, or the needed key set) itself.

#### Parameters

• **datum**: `string`

The order's inline datum, as CBOR hex.

#### Returns

`undefined` \| `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:619](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L619)

***

### hashModuleConfig()

> `static` **hashModuleConfig**(`configInline`): `string`

Commits a module's config into the `module_state`: `blake2b_256` of the
config's serialized CBOR. Pair the result with the module hash in
[buildPoolDatum](DatumBuilderV4.md#buildpooldatum)'s `moduleState`. (Config-less modules use `"80"`.)

#### Parameters

• **configInline**: `string`

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:550](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L550)
