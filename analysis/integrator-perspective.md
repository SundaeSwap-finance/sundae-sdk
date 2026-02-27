# SundaeSwap SDK Integration Analysis: Third-Party Protocol Perspective

**Prepared for:** SundaeSwap Protocol Refactoring Initiative
**Perspective:** Liqwid Finance (hypothetical integrator wanting to embed SundaeSwap)
**Date:** 2026-02-26

---

## Executive Summary

As a third-party protocol seeking to embed SundaeSwap functionality seamlessly, we've identified **significant friction points** in the current SDK architecture that prevent true composability. While the SDK provides excellent functionality for standalone SundaeSwap operations, it was designed with a **"SundaeSwap-first" assumption** rather than a **"protocol-agnostic composability"** model.

### Key Findings

1. **High Integration Barrier**: Requires full Blaze instance initialization just to perform a single swap
2. **Non-Composable Transaction Model**: IComposedTx is a terminal interface—cannot chain with external operations
3. **Version Coupling**: Integrators must explicitly manage SundaeSwap versioning (V1/V3/Stableswaps/NftCheck)
4. **Wallet-Centric Design**: Assumes direct wallet access rather than protocol-to-protocol composition
5. **Monolithic Builder Pattern**: TxBuilder classes are self-contained, not designed for partial transaction construction

---

## 1. Current Integration Surface

### 1.1 Entry Point Analysis

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/SundaeSDK.class.ts`

The SDK exposes a single entry point via `SundaeSDK.new()`:

```typescript
const sdk = SundaeSDK.new({
  blazeInstance: Blaze<Provider, Wallet>
});

const builder = sdk.builder(EContractVersion.V3);
const { tx, build } = await builder.swap({ /* config */ });
```

**Problems for Protocol Integrators:**

1. **Mandatory Blaze Dependency** (lines 59-68, 77-96):
   - Integrators MUST instantiate a full Blaze instance with Provider + Wallet
   - Cannot use SDK without committing to Blaze as transaction library
   - What if Liqwid uses Mesh, Lucid, or custom transaction builders?

2. **Builder Version Selection** (lines 104-129):
   - Integrator must explicitly choose `EContractVersion.V3` vs `V1` vs `NftCheck` vs `Stableswaps`
   - Version management is **exposed as an integration concern**
   - Should be: "Give me the best swap route" not "Tell me which contract version to use"

3. **QueryProvider Coupling** (lines 60-64):
   - Default QueryProvider talks to SundaeSwap's backend
   - No clear extension point for integrators who want to use their own indexers

### 1.2 Configuration Requirements

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/@types/index.ts`

```typescript
export interface ISundaeSDKOptions {
  customQueryProvider?: QueryProvider;
  debug?: boolean;
  minLockAda?: bigint;
  blazeInstance: Blaze<Provider, Wallet>; // ← HARD DEPENDENCY
}
```

**Analysis:**
- `blazeInstance` is **required** (line 15)
- No alternative path for integrators using different transaction libraries
- `customQueryProvider` is optional but still requires extending `QueryProvider` abstract class

### 1.3 Transaction Building Flow

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/TxBuilders/TxBuilder.V3.class.ts`

Current swap flow (lines 605-666):

```typescript
async swap(swapArgs: ISwapConfigArgs): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
  const txInstance = this.newTxInstance(referralFee);  // ← Creates Blaze tx

  // Build datum
  const { inline } = this.datumBuilder.buildSwapDatum({ /* ... */ });

  // Lock assets at order script
  txInstance.lockAssets(
    Core.addressFromBech32(orderScriptAddress),
    makeValue(/* ... */),
    Core.PlutusData.fromCbor(Core.HexBlob(inline))
  );

  return this.completeTx({ tx: txInstance, /* ... */ });
}
```

**Critical Issue:**
- `txInstance` is created internally (line 613)
- Integrator **cannot provide** a partially-built transaction
- Integrator **cannot extract** raw transaction components without calling `build()`
- Result is wrapped in `IComposedTx` which has no "extract" or "merge" API

---

## 2. Composability Gaps

### 2.1 Cross-Protocol Transaction Chaining

**Use Case:** Liqwid wants to build:
```
User Wallet → Liqwid Supply → SundaeSwap Swap → Liqwid Borrow → User Wallet
```

**Current Blocker:**

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/@types/txbuilders.ts` (lines 39-49)

```typescript
export interface IComposedTx<Transaction = unknown, BuiltTransaction = unknown> {
  tx: Transaction;  // ← Blaze-specific transaction instance
  datum: string | undefined;
  fees: ITxBuilderFees;
  build: () => Promise<ITxBuilderSign<BuiltTransaction>>;
}
```

**Problems:**

1. **Terminal Interface**: Once you call `build()`, you get a signed/submittable transaction
   - No API to "merge" with another IComposedTx
   - No API to "extract" UTXOs or outputs for next step
   - No API to "continue building" after SundaeSwap operation

2. **Opaque Transaction Object**: The `tx` field is typed as `Transaction = unknown`
   - Integrators cannot safely access Blaze internals to chain operations
   - Cannot inspect what UTXOs were created, what datums were attached

3. **Immediate Finalization**: `completeTx` (lines 1460-1528 in TxBuilder.V3.class.ts) returns a closure-based API:
   ```typescript
   build() {
     finishedTx = await tx.complete({ useCoinSelection: coinSelection });
     // ← Transaction is FINALIZED here
   }
   ```
   - Coin selection happens internally
   - Cannot defer finalization to allow additional operations

### 2.2 Missing Compositional Primitives

**What Integrators Need:**

1. **Partial Transaction Builder**:
   ```typescript
   // Hypothetical API
   const swapOperations = sundaeSDK.prepareSwap({
     pool, suppliedAsset, minReceivable
   });

   // Returns: { inputs, outputs, datums, redeemers }
   // NOT a finalized transaction
   ```

2. **UTXO Output Forwarding**:
   ```typescript
   // Hypothetical API
   const liqwidSupplyOutput = liqwidSDK.buildSupply({ asset: ADA });

   const swapConfig = sundaeSDK.swap({
     suppliedAsset: liqwidSupplyOutput.asInput(), // ← Use previous output as input
     pool, minReceivable
   });
   ```

3. **Transaction Merge API**:
   ```typescript
   // Hypothetical API
   const combinedTx = TransactionComposer.merge([
     liqwidSupplyTx,
     sundaeSwapTx,
     liqwidBorrowTx
   ]);
   ```

**Current Reality:** None of these are possible with the current SDK.

### 2.3 Order Route Swap: A Glimpse of Composability

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/TxBuilders/TxBuilder.V3.class.ts` (lines 674-794)

The `orderRouteSwap` method shows **internal** composability:

```typescript
async orderRouteSwap(args: IOrderRouteSwapArgs): Promise<IComposedTx> {
  // Build second swap builder
  const secondBuilder = SundaeSDK.new({ blazeInstance: this.blaze })
    .builder(args.swapB.pool.version);

  // Build second swap
  const secondSwapData = await secondBuilder.swap({ /* ... */ });

  // Embed second swap datum in first swap
  const { tx, datum } = await this.swap({
    orderAddresses: {
      DestinationAddress: {
        datum: {
          type: EDatumType.HASH,
          value: secondSwapData.datum  // ← Chaining!
        }
      }
    }
  });
}
```

**Key Insight:**
- SundaeSwap internally chains two swaps by embedding the second swap's datum as the destination of the first
- This proves the protocol **supports** composability at the contract level
- But the SDK **does not expose** this pattern for external integrators

**Why This Matters:**
- If Liqwid wants to chain [Liqwid Supply → SundaeSwap Swap], we'd need to:
  1. Understand SundaeSwap's V3 order datum format
  2. Build a Liqwid order that outputs to a SundaeSwap order script address
  3. Manually construct the chained datum

This is **high-friction integration** requiring deep protocol knowledge.

---

## 3. Integration Burden

### 3.1 SundaeSwap-Specific Knowledge Requirements

**Current State:** Integrators must understand:

1. **Contract Versioning** (file: `SundaeSDK.class.ts`, lines 79-94):
   - V1 vs V3 vs NftCheck vs Stableswaps differences
   - When to use which version (no automatic routing)

2. **Datum Structures** (file: `DatumBuilders/DatumBuilder.V3.class.ts`):
   - OrderDatum schema for V3 contracts
   - How to embed destination datums for chaining

3. **Script Addresses** (file: `TxBuilder.V3.class.ts`, lines 1359-1397):
   - How to generate order script addresses with staking credentials
   - When to use `order.spend` vs `pool.spend` vs `pool.mint`

4. **Fee Structures** (file: `TxBuilder.V3.class.ts`, lines 241-257):
   - `maxScooperFee` from settings UTXO
   - `ORDER_DEPOSIT_DEFAULT` vs `ORDER_ROUTE_DEPOSIT_DEFAULT`
   - Protocol fees, referral fees, swap fees

5. **Reference Scripts** (file: `TxBuilder.V3.class.ts`, lines 155-185):
   - Protocol parameters from SundaeSwap API
   - Reference UTXOs for validators

**Problem:** This is **protocol internals** leaking into integration code. Compare to ideal:

```typescript
// Ideal: Protocol-agnostic
const swap = sundaeSDK.getSwapOperation({
  from: "ADA", to: "INDY", amount: 100_000_000n
});

liqwidTx.addOperation(swap); // ← Should be this simple
```

### 3.2 Version Upgrade Brittleness

**File:** `packages/demo/src/components/Actions/modules/Deposit.tsx` (lines 35-37)

Current demo code:

```typescript
await SDK.builder(
  useV3Contracts ? EContractVersion.V3 : EContractVersion.V1
).deposit({ /* config */ });
```

**Scenario:** SundaeSwap releases V4 contracts with better capital efficiency.

**Impact on Integrators:**

1. **Breaking Change**: Must update all builder call sites to support V4
2. **Manual Migration**: No automatic "use best available pool" routing
3. **Testing Burden**: Must test against V1, V3, and V4 simultaneously
4. **User Confusion**: Liqwid users might see worse rates because Liqwid hasn't upgraded yet

**Ideal Behavior:**

```typescript
// SDK automatically routes to best pool version
await SDK.builder().deposit({ /* config */ });

// SDK internally decides:
// - Is there a V4 pool for this pair? Use it.
// - Fallback to V3 if available.
// - Fallback to V1 if necessary.
```

This is how **Uniswap Router** works—integrators don't choose V2 vs V3, the router does.

### 3.3 Testability from External Perspective

**File:** `packages/core/src/exports/testing.ts`

```typescript
export * from "../TestUtilities/index.js";
```

**Current Testing Utilities:**
- Provide mock pool data, mock UTXOs
- But still require **full Blaze initialization**
- No lightweight "dry-run" mode for transaction construction

**Integrator Pain Points:**

1. **Unit Test Overhead**: Must spin up Blaze provider + wallet mocks to test swap logic
2. **No Deterministic Fixtures**: QueryProvider calls external SundaeSwap API (network calls in tests)
3. **Transaction Simulation**: Cannot validate transaction structure without submitting

**Ideal Testing API:**

```typescript
// Hypothetical
const swapPlan = await sundaeSDK.planSwap({
  pool: mockPool,
  suppliedAsset: new AssetAmount(100_000_000n, ADA_METADATA)
});

expect(swapPlan.outputs).toHaveLength(1);
expect(swapPlan.outputs[0].assets).toContain("INDY");
expect(swapPlan.fees.scooperFee).toBeLessThan(2_000_000n);
```

No transaction building, no wallet, just **validation of swap logic**.

---

## 4. Ideal "Embedded Protocol" API Design

### 4.1 Core Principle: Operation-First, Not Builder-First

**Current:** SDK is **builder-centric**—integrators call methods that build full transactions.

**Proposed:** SDK is **operation-centric**—integrators call methods that return **operations** (additive components).

### 4.2 Proposed API: Composable Operations

```typescript
// ============================================
// NEW: Operation Interface
// ============================================

export interface IOperation {
  inputs: Array<{ utxo: TUTXO; redeemer?: string }>;
  outputs: Array<{ address: string; value: Core.Value; datum?: string }>;
  referenceInputs: TUTXO[];
  datums: string[];
  redeemers: string[];
  requiredSigners: string[];
  fees: { deposit: bigint; scooperFee: bigint };
}

// ============================================
// NEW: SundaeSDK Operation Builder
// ============================================

class SundaeSDK {
  // NEW: Get swap operation WITHOUT building transaction
  async getSwapOperation(args: {
    pool: IPoolData;
    suppliedAsset: AssetAmount;
    minReceivable: AssetAmount;
    fromUtxo?: TUTXO; // ← NEW: Allow specifying exact UTXO to spend
  }): Promise<IOperation> {
    const orderAddress = await this.getOrderScriptAddress();
    const datum = this.datumBuilder.buildSwapDatum({ /* ... */ });

    return {
      inputs: args.fromUtxo ? [{ utxo: args.fromUtxo }] : [],
      outputs: [{
        address: orderAddress,
        value: makeValue(/* supplied asset + scooper fee */),
        datum: datum.inline
      }],
      referenceInputs: [],
      datums: [datum.inline],
      redeemers: [],
      requiredSigners: [],
      fees: {
        deposit: ORDER_DEPOSIT_DEFAULT,
        scooperFee: await this.getMaxScooperFeeAmount()
      }
    };
  }

  // KEEP: Legacy builder API for backward compatibility
  async swap(args: ISwapConfigArgs): Promise<IComposedTx> {
    const operation = await this.getSwapOperation(args);
    return this.operationToTx(operation);
  }
}

// ============================================
// NEW: Transaction Composer (Protocol-Agnostic)
// ============================================

class TransactionComposer {
  private operations: IOperation[] = [];

  addOperation(op: IOperation): this {
    this.operations.push(op);
    return this;
  }

  build(wallet: Wallet): Transaction {
    // Merge all operations
    const allInputs = this.operations.flatMap(op => op.inputs);
    const allOutputs = this.operations.flatMap(op => op.outputs);
    const allDatums = this.operations.flatMap(op => op.datums);

    // Build transaction with coin selection
    const tx = new Transaction();
    allInputs.forEach(i => tx.addInput(i.utxo, i.redeemer));
    allOutputs.forEach(o => tx.addOutput(o.address, o.value, o.datum));
    allDatums.forEach(d => tx.provideDatum(d));

    tx.complete({ coinSelection: true });
    return tx;
  }
}
```

### 4.3 Usage: Liqwid + SundaeSwap Chained Transaction

```typescript
// ============================================
// Liqwid SDK (hypothetical)
// ============================================

const liqwidSupplyOp = await liqwidSDK.getSupplyOperation({
  asset: new AssetAmount(100_000_000n, ADA_METADATA)
});

// ============================================
// SundaeSwap SDK (proposed API)
// ============================================

const sundaeSwapOp = await sundaeSDK.getSwapOperation({
  pool: adaIndyPool,
  suppliedAsset: liqwidSupplyOp.outputs[0].value, // ← Use Liqwid output
  minReceivable: new AssetAmount(50_000_000n, INDY_METADATA),
  fromUtxo: liqwidSupplyOp.outputs[0] // ← Chain UTXO
});

// ============================================
// Compose into single transaction
// ============================================

const tx = new TransactionComposer()
  .addOperation(liqwidSupplyOp)
  .addOperation(sundaeSwapOp)
  .build(wallet);

await tx.sign().submit();
```

**Key Improvements:**

1. **No SundaeSwap-Specific Transaction Library**: Liqwid can use Mesh, Sundae can use Blaze, composer is agnostic
2. **Explicit UTXO Chaining**: `fromUtxo` parameter allows forwarding outputs
3. **Deferred Finalization**: Transaction isn't finalized until `.build()` is called
4. **Inspectable Components**: Liqwid can validate SundaeSwap's operation before committing

### 4.4 Automatic Version Routing

```typescript
// ============================================
// NEW: Smart Pool Router
// ============================================

class PoolRouter {
  async findBestSwapRoute(args: {
    from: IAssetAmountMetadata;
    to: IAssetAmountMetadata;
    amount: bigint;
  }): Promise<{
    pool: IPoolData;
    version: EContractVersion;
    estimatedOutput: bigint;
  }> {
    // Query all available pools (V1, V3, Stableswaps)
    const pools = await this.queryProvider.findAllPoolsForPair(args.from, args.to);

    // Calculate outputs for each pool
    const routes = pools.map(pool => ({
      pool,
      output: this.calculateSwapOutput(pool, args.amount)
    }));

    // Return best route
    return routes.sort((a, b) => b.output - a.output)[0];
  }
}

// ============================================
// Usage: Integrator doesn't care about versions
// ============================================

const bestRoute = await sundaeSDK.router.findBestSwapRoute({
  from: ADA_METADATA,
  to: INDY_METADATA,
  amount: 100_000_000n
});

const swapOp = await sundaeSDK.getSwapOperation({
  pool: bestRoute.pool, // ← SDK picked the best version
  suppliedAsset: new AssetAmount(100_000_000n, ADA_METADATA),
  minReceivable: new AssetAmount(bestRoute.estimatedOutput * 0.97, INDY_METADATA)
});
```

**Benefits:**

1. **Future-Proof**: V4 release doesn't break integrators
2. **Optimal Routing**: Users always get best rates
3. **Simplified Integration**: No version management in application code

---

## 5. Specific Needs for Cross-Protocol Transaction Chaining

### 5.1 UTXO Reference Forwarding

**Current Gap:** No way to specify "use this UTXO as input" for swap/deposit/withdraw.

**File Reference:** `TxBuilder.V3.class.ts` (lines 605-666)

Current swap method signature:
```typescript
async swap(swapArgs: ISwapConfigArgs): Promise<IComposedTx>
```

`ISwapConfigArgs` has no `fromUtxo` field.

**Proposed Addition:**

```typescript
export interface ISwapConfigArgs extends IOrderConfigArgs {
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  swapType: TSwapType;
  fromUtxo?: TUTXO; // ← NEW: Specify exact UTXO to spend
  fromAddress?: string; // ← NEW: Alternative to auto wallet selection
}
```

**Implementation:**

```typescript
async swap(swapArgs: ISwapConfigArgs): Promise<IComposedTx> {
  const txInstance = this.newTxInstance();

  // NEW: If fromUtxo provided, use it directly
  if (swapArgs.fromUtxo) {
    const utxo = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(swapArgs.fromUtxo.hash),
        BigInt(swapArgs.fromUtxo.index)
      )
    ]);
    txInstance.addInput(utxo[0]);
  }

  // Build datum and lock assets as usual
  // ...
}
```

### 5.2 Datum Forwarding for Chained Orders

**Current Gap:** Order-route swaps use internal datum chaining, but not exposed for external protocols.

**Proposed API:**

```typescript
export interface IOrderConfigArgs extends IBaseConfig {
  pool: IPoolData;
  orderAddresses: TOrderAddressesArgs;
  nextOperation?: {
    type: "swap" | "deposit" | "withdraw" | "external";
    datum: string; // ← Datum of next operation
    address: string; // ← Script address of next operation
  };
}
```

**Usage:**

```typescript
// Liqwid builds a "borrow" operation
const liqwidBorrowDatum = liqwidSDK.buildBorrowDatum({ /* ... */ });

// SundaeSwap swap outputs to Liqwid borrow script
const swapOp = await sundaeSDK.getSwapOperation({
  pool: adaIndyPool,
  suppliedAsset: new AssetAmount(100_000_000n, ADA_METADATA),
  nextOperation: {
    type: "external",
    datum: liqwidBorrowDatum,
    address: liqwidBorrowScriptAddress
  }
});
```

### 5.3 Partial Transaction Merging

**Current Gap:** No API to merge two `IComposedTx` objects.

**Proposed:**

```typescript
export interface IComposedTx<Transaction, BuiltTransaction> {
  tx: Transaction;
  datum: string | undefined;
  fees: ITxBuilderFees;
  build: () => Promise<ITxBuilderSign<BuiltTransaction>>;

  // NEW: Merge another composed transaction
  merge(other: IComposedTx): IComposedTx;

  // NEW: Extract raw transaction components
  extract(): {
    inputs: Core.TransactionInput[];
    outputs: Core.TransactionOutput[];
    datums: string[];
    redeemers: string[];
  };
}
```

**Implementation:**

```typescript
class TxBuilderV3 {
  protected completeTx(args: ITxBuilderCompleteTxArgs): IComposedTx {
    // Existing implementation...

    return {
      tx,
      datum,
      fees,
      build: async () => { /* ... */ },

      // NEW: Merge implementation
      merge(other: IComposedTx): IComposedTx {
        const mergedTx = this.newTxInstance();

        // Copy inputs/outputs from both transactions
        this.extract().inputs.forEach(i => mergedTx.addInput(i));
        other.extract().inputs.forEach(i => mergedTx.addInput(i));

        this.extract().outputs.forEach(o => mergedTx.lockAssets(o));
        other.extract().outputs.forEach(o => mergedTx.lockAssets(o));

        return this.completeTx({
          tx: mergedTx,
          referralFee: BlazeHelper.mergeValues(
            this.fees.referral?.amount,
            other.fees.referral?.amount
          )
        });
      },

      // NEW: Extract implementation
      extract() {
        return {
          inputs: Array.from(tx.body().inputs()),
          outputs: Array.from(tx.body().outputs()),
          datums: Array.from(tx.witnessSet().plutusData() ?? []),
          redeemers: Array.from(tx.witnessSet().redeemers() ?? [])
        };
      }
    };
  }
}
```

---

## 6. Dependency Analysis

### 6.1 Hard Dependencies

**File:** `packages/core/package.json` (lines 81-88)

```json
"dependencies": {
  "@blaze-cardano/sdk": "^0.2.31",
  "@blaze-cardano/data": "^0.6.1",
  "@sundaeswap/asset": "^1.0.11",
  "@sundaeswap/bigint-math": "^0.6.3",
  "@sundaeswap/math": "workspace:*",
  "@sundaeswap/fraction": "^1.0.5"
}
```

**Analysis:**

1. **Blaze SDK**: Tightly coupled throughout codebase
   - Used in: `SundaeSDK.class.ts`, all `TxBuilder*.class.ts` files
   - **Impact:** Integrators using Mesh/Lucid must wrap their libraries in Blaze adapters

2. **@sundaeswap/asset**: AssetAmount abstraction
   - Used for: Amount + metadata representation
   - **Impact:** Moderate—integrators must convert to/from AssetAmount

3. **@sundaeswap/math**: Pool math calculations
   - Used for: `getSwapOutput`, `getMinReceivable`, etc.
   - **Impact:** Low—math utilities are reusable

**Recommendation:** Decouple transaction building from Blaze-specific types.

### 6.2 Implicit Dependencies

1. **Network Calls**: QueryProviderSundaeSwap makes external API calls
   - Default: `https://api.sundaeswap.finance/`
   - **Impact:** Integrators with custom indexers must implement `QueryProvider` interface

2. **Blockfrost**: Demo app hardcodes Blockfrost provider
   - **File:** `packages/demo/src/state/context.tsx` (lines 96-108)
   - **Impact:** Production integrators must configure their own provider

---

## 7. Recommendations Roadmap

### Phase 1: Additive Changes (Non-Breaking)

1. **Add `IOperation` Interface**
   - New export alongside existing `IComposedTx`
   - Provides raw transaction components without library coupling

2. **Add `getXxxOperation()` Methods**
   - `getSwapOperation()`, `getDepositOperation()`, etc.
   - Return `IOperation` instead of `IComposedTx`
   - Existing methods remain unchanged

3. **Add `fromUtxo` Parameter**
   - Extend `ISwapConfigArgs`, `IDepositConfigArgs`, etc.
   - Allow specifying exact UTXO to spend
   - Optional parameter (backward compatible)

4. **Add PoolRouter**
   - New `PoolRouter` class for automatic version selection
   - `findBestSwapRoute()` method
   - Integrators can opt-in to smart routing

### Phase 2: Refactoring (Minor Breaking Changes)

1. **Extract Transaction Builder Interface**
   - Define `ITxBuilder` interface not tied to Blaze
   - Provide `BlazeTxBuilder` implementation
   - Allow `MeshTxBuilder`, `LucidTxBuilder` implementations

2. **Decouple QueryProvider from SDK Instantiation**
   - Make `QueryProvider` a separate service
   - SDK methods accept `QueryProvider` as parameter
   - Reduces stateful dependencies

3. **Introduce `TransactionComposer`**
   - Protocol-agnostic transaction merger
   - Accepts `IOperation[]` from any protocol
   - Handles coin selection, balancing, finalization

### Phase 3: Major Refactor (Breaking Changes)

1. **SDK as Operation Factory**
   - Primary API returns `IOperation` objects
   - `IComposedTx` becomes convenience wrapper
   - Full decoupling from transaction libraries

2. **Remove Version Enums from Public API**
   - Version selection is internal to PoolRouter
   - Integrators call `sdk.swap()`, not `sdk.builder(V3).swap()`

3. **Stateless SDK**
   - No `blazeInstance` stored in SDK class
   - All methods accept dependencies as parameters
   - Easier to test, easier to integrate

---

## 8. Conclusion

The current @sundaeswap/core SDK is excellent for **application developers** building SundaeSwap-first dApps. However, it presents significant friction for **protocol integrators** who want to embed SundaeSwap as one component in a larger transaction flow.

### Immediate Actionable Recommendations

1. **Add `IOperation` Interface** (1 week effort)
   - Provides escape hatch for advanced integrators
   - Non-breaking addition

2. **Add `fromUtxo` Parameter** (2 days effort)
   - Enables UTXO chaining for order-routing
   - Minor API extension

3. **Document Cross-Protocol Integration** (1 week effort)
   - Write guide: "How to Chain SundaeSwap with Other Protocols"
   - Show datum forwarding, UTXO references, manual transaction merging

4. **Introduce PoolRouter** (2 weeks effort)
   - Hides version complexity from integrators
   - Future-proofs against V4/V5 releases

### Long-Term Vision

Transform SundaeSwap SDK from a **monolithic transaction builder** to a **composable operation library**. Integrators should be able to:

```typescript
// Simplified integration (future state)
const swap = await sundaeSDK.operations.swap({
  from: ADA, to: INDY, amount: 100_000_000n
});

liqwidTx.add(swap);
await liqwidTx.submit();
```

No Blaze, no version management, no transaction library coupling—just **composable operations**.

---

**Analysis prepared by:** AI Integration Consultant
**Contact:** sundaeswap-dev@sundae.fi (hypothetical)
