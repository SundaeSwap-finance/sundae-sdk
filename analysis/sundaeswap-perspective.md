# SundaeSwap SDK Architecture Analysis: Internal Developer Perspective

**Date:** 2026-02-26
**Focus:** Pain points and requirements for composable Builder API refactor

---

## Executive Summary

The current SDK architecture uses monolithic, version-specific TxBuilders (`TxBuilderV1`, `TxBuilderV3`) with ~1,500 lines of code each, implementing hardcoded methods for specific transaction patterns (swap, deposit, withdraw, zap, orderRouteSwap, migrateLiquidity). This analysis examines the current implementation to identify what **must be preserved** and what **creates friction** when building complex, multi-step transactions.

---

## 1. Current Architecture Overview

### 1.1 TxBuilder Structure

**File Locations:**
- `/packages/core/src/TxBuilders/TxBuilder.V1.class.ts` (1,513 lines)
- `/packages/core/src/TxBuilders/TxBuilder.V3.class.ts` (1,529 lines)
- Abstract bases: `TxBuilderAbstractV1.class.ts`, `TxBuilderAbstractV3.class.ts`

**Core Pattern:**
```typescript
class TxBuilderV3 extends TxBuilderAbstractV3 {
  async swap(args: ISwapConfigArgs): Promise<IComposedTx>
  async deposit(args: IDepositConfigArgs): Promise<IComposedTx>
  async withdraw(args: IWithdrawConfigArgs): Promise<IComposedTx>
  async orderRouteSwap(args: IOrderRouteSwapArgs): Promise<IComposedTx>
  async zap(args: IZapConfigArgs): Promise<IComposedTx>
  async mintPool(args: IMintPoolConfigArgs): Promise<IComposedTx>
  async strategy(args: IStrategyConfigInputArgs): Promise<IComposedTx>
  async cancel(args: ICancelConfigArgs): Promise<IComposedTx>
  async update(args: IUpdateArgs): Promise<IComposedTx>
}
```

### 1.2 DatumBuilder Coupling

**File Locations:**
- `/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts` (309 lines)
- `/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts` (841 lines)

**Current Pattern:**
Each TxBuilder owns a `DatumBuilder` instance that constructs version-specific datums:

```typescript
class DatumBuilderV3 {
  buildSwapDatum(args: IDatumBuilderSwapV3Args): TDatumResult<V3Types.OrderDatum>
  buildDepositDatum(args: IDatumBuilderDepositV3Args): TDatumResult<V3Types.OrderDatum>
  buildWithdrawDatum(args: IDatumBuilderWithdrawV3Args): TDatumResult<V3Types.OrderDatum>
  buildStrategyDatum(args: IDatumBuilderStrategyV3Args): TDatumResult<V3Types.OrderDatum>
  buildMintPoolDatum(args: IDatumBuilderMintPoolArgs): TDatumResult<V3Types.PoolDatum>
}
```

**Datum construction is tightly coupled to transaction type** — you cannot construct arbitrary datums without invoking specific builder methods.

### 1.3 Config Pattern

**File Location:** `/packages/core/src/Configs/SwapConfig.class.ts`

Each transaction type has a corresponding Config class that validates and normalizes arguments:

```typescript
class SwapConfig extends OrderConfig<...> {
  suppliedAsset?: AssetAmount
  minReceivable?: AssetAmount

  setSuppliedAsset(asset): this
  setMinReceivable(amount): this
  buildArgs(): { pool, suppliedAsset, orderAddresses, minReceivable, referralFee }
  validate(): void
}
```

**Purpose:** Separates argument validation from transaction building logic.

---

## 2. Pain Points & Developer Friction

### 2.1 Combinatorial Explosion of Methods

**Current Reality:**
Every new transaction pattern requires a new method in the builder class. Evidence from code:

- `swap()` — Basic swap (lines 259-326 in V1, 605-666 in V3)
- `orderRouteSwap()` — Chained swap across two pools (lines 335-462 in V1, 674-794 in V3)
- `zap()` — Swap + deposit in single tx (lines 848-994 in V1, 1214-1350 in V3)
- `migrateLiquidityToV3()` — V1→V3 liquidity migration (lines 1039-1424 in V1, ~385 lines!)

**Problem:**
```typescript
// What if you need: Swap → Deposit → Stake?
// What if you need: Withdraw → Split → Deposit to two pools?
// What if you need: Zap into Pool A → Route through Pool B → Deposit to Pool C?
```

**Current solution:** Write a new hardcoded method. This doesn't scale.

**Evidence from V1 `orderRouteSwap()` (lines 335-462):**
```typescript
async orderRouteSwap(args: IOrderRouteSwapArgs): Promise<IComposedTx> {
  // 1. Build second builder instance for destination pool
  const secondBuilder = SundaeSDK.new(...).builder(args.swapB.pool.version)

  // 2. Manually construct first swap with second swap's datum in metadata
  const secondSwapData = await secondBuilder.swap({...swapB})
  const datumHash = Core.PlutusData.fromCbor(...).hash()

  // 3. Call swap() with modified orderAddresses pointing to second pool
  const { tx } = await this.swap({
    ...swapA,
    orderAddresses: {
      DestinationAddress: {
        datum: { type: EDatumType.HASH, value: datumHash }
      }
    }
  })

  // 4. Manually attach metadata with second datum
  const metadata = new Map<bigint, Core.Metadatum>()
  metadata.set(103251n, /* ...datum mapping... */)
  tx.setAuxiliaryData(data)

  return this.completeTx({...})
}
```

**Why this is painful:**
- **127 lines of boilerplate** to chain two swaps
- **Manual fee accumulation** (`mergedReferralFee`)
- **Manual datum hash construction and metadata attachment**
- **Hardcoded to exactly 2 swaps** — can't generalize to 3+ hop routes
- **Cross-version complexity** — V1→V3 routes require different datum formats

### 2.2 Cross-Version Operations are Hardcoded

**Current Implementation:** `migrateLiquidityToV3()` (lines 1039-1424 in V1)

This single method handles:
1. Building V1 withdraw datums
2. Building V3 deposit datums
3. Calculating LP token redemption math
4. Managing yield farming positions
5. Accumulating fees across version boundaries

**385 lines of deeply nested logic** that cannot be reused for:
- V3 → V1 migrations (if ever needed)
- Partial migrations (migrate some pools but not others)
- Custom migration flows (e.g., migrate + stake in one tx)

**Evidence of coupling (lines 1282-1300):**
```typescript
const v3DatumBuilder = new DatumBuilderV3(this.network)
const { hash: depositHash, inline: depositInline } =
  v3DatumBuilder.buildDepositDatum({
    destinationAddress: withdrawArgs.orderAddresses.DestinationAddress,
    ident: depositPool.ident,
    order: { assetA: ..., assetB: ... },
    scooperFee: v3MaxScooperFee,
  })

const { inline: withdrawInline } =
  this.datumBuilder.buildWithdrawDatum({
    ident: withdrawConfig.pool.ident,
    orderAddresses: {
      DestinationAddress: {
        address: v3OrderScriptAddress,
        datum: { type: EDatumType.HASH, value: depositHash }
      }
    },
    // ...
  })
```

**The builder must manually coordinate:**
- Creating the V3 builder instance
- Building the deposit datum first (to get its hash)
- Referencing that hash in the withdraw order's destination
- Merging fees and deposits across both operations

### 2.3 Datum Construction is Opaque

**Current API:**
```typescript
const swapDatum = this.datumBuilder.buildSwapDatum({
  ident: pool.ident,
  destinationAddress: orderAddresses.DestinationAddress,
  ownerAddress: ownerAddress,
  order: { minReceived: minReceivable, offered: suppliedAsset },
  scooperFee,
})
// Returns: { hash, inline, schema }
```

**Problem:** Developers cannot:
- Build datums without a TxBuilder instance
- Modify datum fields after construction
- Compose datum construction with arbitrary logic
- Reuse datum construction across different transaction patterns

**Example friction:** In `zap()` (lines 1264-1276 in V3), the deposit datum must be built **before** the swap datum because the swap needs to reference the deposit's hash:

```typescript
// MUST build deposit datum first to get its hash
const depositData = this.datumBuilder.buildDepositDatum({...})

// THEN build swap datum that references it
const { inline } = this.datumBuilder.buildSwapDatum({
  destinationAddress: {
    address: await this.generateScriptAddress(...),
    datum: { type: EDatumType.HASH, value: depositData.hash }
  },
  // ...
})
```

**Why this hurts:**
- Order dependencies between datum construction steps
- Cannot build datums in parallel
- Cannot inspect/modify intermediate datums
- Tight coupling to specific transaction flows

### 2.4 Testing Complex Flows Requires Mocking Entire Builders

**Evidence from test file** (`TxBuilder.V3.class.test.ts`):

```typescript
spyOn(TxBuilderV3.prototype, "getSettingsUtxo").mockResolvedValue(...)
spyOn(TxBuilderV3.prototype, "getAllReferenceUtxos").mockResolvedValue(...)
spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScripts").mockResolvedValue(...)
```

**To test a 2-hop swap route** (lines 397-474), you must:
1. Mock all builder dependencies (settings, references, protocol params)
2. Execute the full `orderRouteSwap()` method
3. Assert on the final transaction structure
4. Cannot test intermediate steps in isolation

**Impact on testing:**
- **Integration tests only** — cannot unit test transaction composition logic
- **Fragile mocks** — changes to internal builder state break tests
- **Slow test execution** — must build full transactions even for simple assertions
- **Hard to test edge cases** — complex setup required for each scenario

---

## 3. Current Transaction Patterns & Requirements

### 3.1 Single-Pool Operations

**Swap** (most common):
```typescript
// Current
await builder.swap({
  pool: PREVIEW_DATA.pools.v3,
  suppliedAsset: PREVIEW_DATA.assets.tada,
  swapType: { type: ESwapType.MARKET, slippage: 0.03 },
  orderAddresses: {
    DestinationAddress: {
      address: "addr_test1...",
      datum: { type: EDatumType.NONE }
    }
  }
})
```

**Must preserve:**
- Pool identification via `ident`
- Slippage calculation (market orders)
- Limit order support (explicit minReceivable)
- Scooper fee calculation (from settings UTXO)
- Staking key inheritance (V3 only — order script gets user's staking key)

### 3.2 Chained Operations (Order Routes)

**Two-hop swap** (`orderRouteSwap`):
```typescript
// Current: Hardcoded method
await builder.orderRouteSwap({
  ownerAddress: "addr_test1...",
  swapA: { pool: POOL_ADA_TINDY, suppliedAsset: TINDY_20 },
  swapB: { pool: POOL_TINDY_BTC, /* inferred from swapA output */ }
})
```

**Must support:**
- Arbitrary-length routes (not just 2 hops)
- Cross-version routes (V1 → V3 → V1)
- Fee accumulation across all hops
- Datum chaining (each order's output feeds next order's input)
- Metadata attachment for hashed datums (V1 compat)

**Current implementation detail** (lines 730-765 in V3):
```typescript
const referralFeeAmount = BlazeHelper.mergeValues(
  swapA.referralFee?.payment,
  swapB.referralFee?.payment
)
// Fees must be manually accumulated!

const datumHash = Core.PlutusData.fromCbor(...).hash()
const { tx, datum, fees } = await this.swap({
  ...swapA,
  orderAddresses: {
    DestinationAddress: {
      datum: {
        type: secondBuilder.getDatumType(), // V1 uses HASH, V3 can use INLINE
        value: secondBuilder.getDatumType() === EDatumType.HASH
          ? datumHash
          : (secondSwapData.datum as string)
      }
    }
  }
})
```

### 3.3 Zap Operations (Swap + Deposit)

**Current implementation** (`zap()` in V3, lines 1214-1350):

```typescript
// 1. Calculate 50% split
const halfSuppliedAmount = new AssetAmount(
  Math.ceil(Number(suppliedAsset.amount) / 2),
  suppliedAsset.metadata
)

// 2. Estimate swap output
const minReceivable = SundaeUtils.getMinReceivableFromSlippage(
  pool, halfSuppliedAmount, swapSlippage ?? 0.3
)

// 3. Build deposit datum (for the OTHER half + swap output)
const depositData = this.datumBuilder.buildDepositDatum({...})

// 4. Build swap datum that points to deposit
const { inline } = this.datumBuilder.buildSwapDatum({
  destinationAddress: {
    datum: { type: EDatumType.HASH, value: depositData.hash }
  },
  order: { offered: halfSuppliedAmount, minReceived: minReceivable }
})

// 5. Attach deposit datum to metadata
const metadata = new Map<bigint, Core.Metadatum>()
metadata.set(103251n, /* ...datum bytes... */)
tx.setAuxiliaryData(data)
```

**Must support:**
- Arbitrary asset splits (not just 50/50)
- Multi-step zaps (e.g., swap A→B, swap B→C, deposit C+D to Pool)
- Custom slippage per swap leg
- Deposit to different pool than swap pool

### 3.4 Liquidity Migration (V1 → V3)

**Current implementation** (`migrateLiquidityToV3()` in V1, lines 1039-1424):

**Key requirements:**
1. **Batch processing** — multiple pools migrated in single tx
2. **LP math** — calculate expected asset amounts from LP tokens
3. **Yield farming support** — unlock staked LP tokens and migrate
4. **Fee accumulation** — V1 scooper fee + V3 scooper fee + referral fees
5. **Metadata management** — V3 deposit datums attached to V1 withdrawals

**Evidence of complexity** (lines 1256-1273):
```typescript
migrations.forEach(({ withdrawConfig, depositPool }) => {
  const scooperFee = this.__getParam("maxScooperFee") + v3MaxScooperFee
  totalScooper += scooperFee
  totalDeposit += ORDER_DEPOSIT_DEFAULT

  const [coinA, coinB] = ConstantProductPool.getTokensForLp(
    withdrawArgs.suppliedLPAsset.amount,
    withdrawConfig.pool.liquidity.aReserve,
    withdrawConfig.pool.liquidity.bReserve,
    withdrawConfig.pool.liquidity.lpTotal
  )

  // Build V3 deposit datum
  const { hash: depositHash, inline: depositInline } =
    v3DatumBuilder.buildDepositDatum({...})

  // Build V1 withdraw datum that points to V3 deposit
  const { inline: withdrawInline } = this.datumBuilder.buildWithdrawDatum({
    orderAddresses: {
      DestinationAddress: {
        address: v3OrderScriptAddress,
        datum: { type: EDatumType.HASH, value: depositHash }
      }
    }
  })
})
```

**This pattern should generalize to:**
- V3 → V3 rebalancing (withdraw from Pool A, deposit to Pool B)
- Partial migrations (withdraw X%, migrate Y%, keep remainder)
- Conditional migrations (migrate only if price moves favorably)

---

## 4. Integration Patterns (How Developers Use Builders Today)

### 4.1 Frontend Transaction Construction

**Current pattern** (inferred from test structure):

```typescript
// 1. Instantiate SDK with provider
const sdk = new SundaeSDK({ blazeInstance: blaze })

// 2. Get builder for specific contract version
const builder = sdk.builder(EContractVersion.V3)

// 3. Call specific method
const { build, fees, datum } = await builder.swap({...})

// 4. Build, sign, submit
const { sign } = await build()
const { submit } = await sign()
const txHash = await submit()
```

**Developer expectations:**
- **Type safety** — incorrect args cause TypeScript errors
- **Fee transparency** — all fees known before signing
- **Datum inspection** — can view/log datum before submission
- **Partial execution** — can build tx without signing/submitting

### 4.2 Error Handling & Validation

**Current approach** (from Config classes):

```typescript
class SwapConfig {
  validate(): void {
    if (!this.suppliedAsset) {
      throw new Error("You haven't funded this swap!")
    }
    if (!this.minReceivable) {
      throw new Error("Invalid swapType supplied")
    }
    if (this.minReceivable.amount < 0n) {
      throw new Error("Cannot use negative minimum receivable")
    }
  }
}
```

**Validation happens at Config build time**, not at builder method call time. This allows:
- Early error detection (before expensive UTXO queries)
- Fluent API with method chaining
- Clear error messages

**Must preserve:** Config-based validation pattern for type-specific constraints.

### 4.3 Parameter Calculation & Utilities

**Utilities used by builders** (`SundaeUtils.class.ts`):

```typescript
// Calculate minimum receivable from slippage
getMinReceivableFromSlippage(pool, suppliedAsset, slippage)

// Determine swap direction (A→B or B→A)
getAssetSwapDirection(suppliedAsset, [assetA, assetB])

// Sort assets lexicographically (V3 requirement)
sortSwapAssetsWithAmounts([assetA, assetB])

// Accumulate assets + fees for payment
accumulateSuppliedAssets({ suppliedAssets, scooperFee, orderDeposit })

// Validate pool ident format
isV3PoolIdent(ident)

// Extract ident from LP asset ID
getIdentFromAssetId(lpAsset.assetId)
```

**Must preserve:** These utility functions are essential for transaction construction logic. New builder API should:
- Reuse existing utilities
- Not duplicate this logic
- Allow developers to use these utilities directly if building custom flows

---

## 5. Must-Preserve Features

### 5.1 Protocol-Specific Logic

**Settings UTXO management** (V3 only):
```typescript
async getMaxScooperFeeAmount(): Promise<bigint> {
  const settings = await this.getSettingsUtxoDatum()
  const { baseFee, simpleFee } = parse(SettingsDatum, ...)
  return baseFee + simpleFee
}
```

**Reference UTXOs** (V3 only):
```typescript
const { references } = await this.getProtocolParams()
return await this.blaze.provider.resolveUnspentOutputs(
  references.map(({ txIn }) => new Core.TransactionInput(...))
)
```

**Validator script lookup**:
```typescript
const { compiledCode } = await this.getValidatorScript("order.spend")
const scriptValidator = Core.Script.newPlutusV1Script(...)
```

**Must preserve:** These protocol-specific lookups should remain encapsulated within version-specific builders or a shared protocol manager.

### 5.2 Blaze Transaction Construction

**Current pattern** (lines 649-656 in V3 `swap()`):
```typescript
const payment = SundaeUtils.accumulateSuppliedAssets({
  suppliedAssets: [...extraSuppliedAssets, suppliedAsset],
  scooperFee,
  orderDeposit: ORDER_DEPOSIT_DEFAULT
})

txInstance.lockAssets(
  Core.addressFromBech32(orderScriptAddress),
  makeValue(payment.lovelace, ...Object.entries(payment)...),
  Core.PlutusData.fromCbor(Core.HexBlob(inline))
)
```

**Must preserve:**
- Blaze SDK integration (TxBuilder instance)
- Asset accumulation utilities
- Datum attachment patterns (inline vs. hash)
- Script address generation with staking key inheritance

### 5.3 Fee Calculation & Transparency

**Current fee structure** (from `ITxBuilderFees`):
```typescript
interface ITxBuilderFees {
  cardanoTxFee?: AssetAmount  // Calculated after build()
  deposit: AssetAmount         // Order deposit (2 ADA default)
  scooperFee: AssetAmount      // Protocol fee from settings
  referral?: AssetAmount       // Optional referral fee
}
```

**Critical requirement:** Fees must be known **before** transaction signing. Frontend needs to show:
- Total cost to user
- Breakdown by fee type
- Impact of referral fees

**Evidence from test** (lines 334-343 in V3 tests):
```typescript
expect(fees).toMatchObject({
  deposit: expect.objectContaining({
    amount: ORDER_DEPOSIT_DEFAULT,
    metadata: ADA_METADATA
  }),
  scooperFee: expect.objectContaining({
    amount: 1_000_000n,
    metadata: ADA_METADATA
  })
})
```

### 5.4 Datum Inspection & Debugging

**Current API returns datum CBOR**:
```typescript
const { build, fees, datum } = await builder.swap({...})
console.log("Datum CBOR:", datum)
// => "d8799fd8799f581ca933477ea1..."
```

**Why this matters:**
- Developers can verify datum construction before signing
- Support teams can debug failed orders by inspecting on-chain datums
- Testing can assert on exact datum structure

**Must preserve:** Datum visibility in transaction result.

---

## 6. Recommendations for Composable Builder API

### 6.1 Preserve the Config Pattern

**Current:**
```typescript
const config = new SwapConfig({
  pool,
  suppliedAsset,
  swapType: { type: ESwapType.MARKET, slippage: 0.03 },
  orderAddresses: {...}
})

const result = await builder.swap(config)
```

**Recommendation:** Keep Config classes for type-specific validation and argument normalization. They should be inputs to composable steps, not the top-level API.

### 6.2 Separate Datum Construction from Transaction Building

**Problem:** Current API couples datum building to transaction building.

**Solution:** Make DatumBuilders first-class, reusable:
```typescript
// Build datum independently
const swapDatum = datumBuilder.swap({
  pool,
  offered: assetA,
  minReceived: assetB
})

// Use datum in transaction
const tx = await builder
  .lockToScript(orderScriptAddress, payment, swapDatum)
  .build()
```

**Benefits:**
- Datum construction can be tested in isolation
- Datums can be composed/modified before transaction building
- Cross-version datum references are explicit

### 6.3 Chainable Transaction Steps

**Goal:** Enable arbitrary transaction flows without hardcoded methods.

**Example API:**
```typescript
// Two-hop swap
const tx = await builder
  .swap(swapA_Config)           // Returns builder with swap step queued
  .then(swapB_Config)           // Chains second swap
  .withReferralFee(fee)         // Accumulates fees across both
  .build()

// Zap (swap + deposit)
const tx = await builder
  .swap({
    pool,
    suppliedAsset: halfSupply,
    minReceivable: estimatedOutput
  })
  .deposit({
    pool,
    assetA: remainingSupply,
    assetB: estimatedOutput  // Reference previous step output
  })
  .build()
```

**Key insight:** Each step should return a builder instance, allowing fluent chaining.

### 6.4 Explicit Fee Management

**Problem:** Current API silently accumulates fees in complex operations.

**Solution:** Make fee accumulation explicit:
```typescript
const tx = await builder
  .swap(configA)
  .withScooperFee(fee1)         // Explicit fee for step 1
  .swap(configB)
  .withScooperFee(fee2)         // Explicit fee for step 2
  .withReferralFee(referral)    // Optional referral fee
  .build()

// Or: Auto-calculate all fees at build time
const tx = await builder
  .swap(configA)
  .swap(configB)
  .calculateFees()              // Returns { total, breakdown }
  .build()
```

### 6.5 Protocol Abstraction Layer

**Problem:** V1 and V3 have different datum formats, script addresses, fee structures.

**Solution:** Encapsulate protocol-specific logic in adapters:
```typescript
interface ProtocolAdapter {
  getScriptAddress(type: "order" | "pool"): Promise<string>
  getMaxScooperFee(): Promise<bigint>
  getDatumType(): EDatumType  // HASH (V1) vs INLINE (V3)
  buildOrderDatum(config: OrderConfig): TDatumResult
}

class V3Adapter implements ProtocolAdapter {
  async getScriptAddress(type) {
    return this.generateScriptAddress(type === "order" ? "order.spend" : "pool.mint")
  }
  // ...
}
```

**Benefits:**
- Cross-version operations are explicit protocol adaptations
- Testing can mock protocol adapters
- New contract versions (V4+) plug into same interface

### 6.6 Preserve Existing Utility Functions

**Recommendation:** DO NOT reimplement these. They work correctly and have edge case handling:

- `SundaeUtils.getMinReceivableFromSlippage()` — handles pool liquidity correctly
- `SundaeUtils.sortSwapAssetsWithAmounts()` — V3 lexicographical ordering
- `SundaeUtils.accumulateSuppliedAssets()` — payment calculation with fees
- `DatumBuilderV3.computePoolId()` — generates deterministic pool idents

**New API should expose these utilities** so developers building custom flows can use them.

---

## 7. Critical Constraints for New Architecture

### 7.1 Backward Compatibility

**Requirement:** Existing code using `builder.swap()`, `builder.deposit()`, etc. **must continue to work**.

**Solution options:**
1. **Facade methods** — Keep current API as thin wrappers around new composable API
2. **Deprecation period** — Mark old methods as deprecated but functional for 6-12 months
3. **Dual export** — Export both `TxBuilderV3` (old) and `ComposableBuilder` (new)

**Recommendation:** Option 3 is safest. Existing projects upgrade at their own pace.

### 7.2 Type Safety

**Requirement:** TypeScript must catch:
- Invalid pool references
- Missing required parameters
- Incompatible asset combinations
- Cross-version datum mismatches

**Evidence from current code:**
```typescript
// V1 enforces datum type
if (DestinationAddress.datum.type !== EDatumType.HASH && destinationIsOrderScript) {
  throw new Error("Inline datum types are not supported in V1 contracts!")
}

// V3 validates pool ident format
if (!SundaeUtils.isV3PoolIdent(ident)) {
  throw new Error(DatumBuilderV3.INVALID_POOL_IDENT)
}
```

**New API must maintain these runtime validations** and ideally encode them in TypeScript types.

### 7.3 Performance

**Current behavior:**
- Protocol params cached in builder instance
- Reference UTXOs fetched once per transaction
- Settings UTXO queried once, datum cached

**New API must NOT:**
- Fetch protocol params on every step
- Re-query reference UTXOs unnecessarily
- Invalidate caches between chained operations

**Solution:** Builder instance maintains state across steps, caches remain valid within a transaction chain.

### 7.4 Testing Requirements

**Must support:**
1. **Unit testing individual steps** (swap, deposit, etc.)
2. **Integration testing full chains** (swap → deposit → stake)
3. **Mocking protocol dependencies** (settings UTXO, reference scripts)
4. **Asserting on intermediate state** (datum construction, fee accumulation)

**Evidence from current tests:** 1,329 lines of test code for V3 builder alone. New architecture must be at least as testable.

---

## 8. Conclusion: Developer Experience Requirements

As a SundaeSwap developer building production features, I need:

1. **Composability** — Chain arbitrary operations without hardcoded methods
2. **Transparency** — See fees, datums, and transaction structure before signing
3. **Type Safety** — Invalid configurations caught at compile time
4. **Protocol Abstraction** — Cross-version operations are explicit, not magic
5. **Backward Compatibility** — Existing code continues working during migration
6. **Testing** — Individual steps and full chains testable in isolation
7. **Performance** — No unnecessary network calls or cache invalidation
8. **Debuggability** — Clear error messages with datum inspection

**The new Builder API should feel like:**
- **Building a transaction** — not invoking hardcoded methods
- **Composing steps** — not writing 385-line migration methods
- **Declaring intent** — not managing Blaze SDK internals

**Success metric:** A 3-hop cross-version swap route should be **~20 lines of code**, not 127+ lines with manual metadata management.
