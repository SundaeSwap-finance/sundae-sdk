# Builder V3 Feasibility Analysis: Multi-Asset Output Handling

**Date:** February 26, 2026
**Purpose:** Validate the proposed Builder layer architecture with dynamic output chaining, focusing on how to handle operations that produce multiple outputs.

---

## Executive Summary

**Critical Finding:** The proposed `ITaskResult` interface with a single `output: AssetAmount` field is **insufficient** for supporting all SundaeSwap operations. The `withdraw` operation returns **two assets** (assetA + assetB), requiring either:
1. An array-based output structure: `outputs: AssetAmount[]`
2. Operation-specific result interfaces
3. A discriminated union of result types

**Recommendation:** Use **option 1** (array-based) with helper accessors for type-safe consumption.

---

## 1. Operation Output Analysis

### 1.1 Single-Asset Outputs

#### **swap()**
- **Output Type:** Single `AssetAmount`
- **Location:** `packages/core/src/TxBuilders/TxBuilder.V3.class.ts:605-667`
- **Returns:** The received asset (opposite of supplied asset)
- **Calculation:** `SundaeUtils.getSwapOutput(pool, suppliedAsset)` returns `TSwapOutcome.output`
- **Math Function:** `ConstantProductPool.getSwapOutput()` or `StableSwapsPool.getSwapOutput()`
  - Located in `packages/math/src/PoolMath/ConstantProductPool.ts:159-206`
  - Returns: `{ input, output, lpFee, nextInputReserve, nextOutputReserve, priceImpact }`

**Example:**
```typescript
// User swaps 100 ADA → receives X SUNDAE
swap({
  pool: adaSundaePool,
  suppliedAsset: new AssetAmount(100_000_000n, ADA_METADATA),
  // ...
})
// Output: AssetAmount(X, SUNDAE_METADATA)
```

#### **deposit()**
- **Output Type:** Single `AssetAmount` (LP tokens)
- **Location:** `packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1064-1105`
- **Returns:** LP tokens representing pool share
- **Calculation:** Pool math `calculateLiquidity()` returns `generatedLp`
- **Math Functions:**
  - Constant Product: `packages/math/src/PoolMath/ConstantProductPool.ts:34-79`
    - Returns: `{ nextTotalLp, generatedLp, shareAfterDeposit, aChange, bChange, actualDepositedA, actualDepositedB }`
  - Stableswaps: `packages/math/src/PoolMath/StableSwapsPool.ts:224-258`
    - Returns: Same structure (but `aChange` and `bChange` are always `0n`)

**Example:**
```typescript
// User deposits 100 ADA + 500 SUNDAE → receives Y LP tokens
deposit({
  pool: adaSundaePool,
  suppliedAssets: [
    new AssetAmount(100_000_000n, ADA_METADATA),
    new AssetAmount(500_000_000n, SUNDAE_METADATA)
  ],
  // ...
})
// Output: AssetAmount(Y, LP_TOKEN_METADATA)
```

**Note:** Deposit can return **surplus assets** (`aChange`, `bChange`) if amounts don't match pool ratio, but these are refunded automatically by the contract, not tracked as outputs in the builder.

---

### 1.2 Multi-Asset Outputs

#### **withdraw()** ⚠️ **CRITICAL: TWO OUTPUTS**
- **Output Type:** **TWO `AssetAmount` objects** (assetA + assetB)
- **Location:** `packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1115-1161`
- **Returns:** Both pool assets (assetA and assetB) in exchange for LP tokens
- **Calculation:** Pool math `getTokensForLp()` returns `[assetA_amount, assetB_amount]`
- **Math Functions:**
  - Constant Product: `packages/math/src/PoolMath/ConstantProductPool.ts:125-133`
    ```typescript
    export const getTokensForLp = (
      lp: bigint,
      aReserve: bigint,
      bReserve: bigint,
      totalLp: bigint,
    ): SharedPoolMath.TPair => [
      new Fraction(lp * aReserve, totalLp).quotient,
      new Fraction(lp * bReserve, totalLp).quotient,
    ];
    ```
  - Stableswaps: `packages/math/src/PoolMath/StableSwapsPool.ts:273-281` (same signature)

**Example:**
```typescript
// User withdraws 1000 LP tokens → receives both ADA and SUNDAE
withdraw({
  pool: adaSundaePool,
  suppliedLPAsset: new AssetAmount(1000_000_000n, LP_TOKEN_METADATA),
  // ...
})
// Output: [
//   AssetAmount(95_000_000n, ADA_METADATA),      // assetA
//   AssetAmount(475_000_000n, SUNDAE_METADATA)   // assetB
// ]
```

---

### 1.3 Compound Operations

#### **zap()** (Swap + Deposit)
- **Output Type:** Single `AssetAmount` (LP tokens)
- **Location:** `packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1225-1361`
- **Process:**
  1. Swaps half of supplied asset → receives opposite asset
  2. Deposits both assets → receives LP tokens
- **Returns:** Final LP tokens (intermediate swap output is consumed internally)

**Example:**
```typescript
// User zaps 200 ADA → swap 100 ADA for SUNDAE → deposit 100 ADA + SUNDAE → receive LP
zap({
  pool: adaSundaePool,
  suppliedAsset: new AssetAmount(200_000_000n, ADA_METADATA),
  // ...
})
// Output: AssetAmount(Z, LP_TOKEN_METADATA)
```

**Internal Chaining Logic (lines 1244-1286):**
```typescript
// Calculate swap output for half the supplied amount
const halfSuppliedAmount = new AssetAmount(
  Math.ceil(Number(suppliedAsset.amount) / 2),
  suppliedAsset.metadata,
);

const minReceivable = SundaeUtils.getMinReceivableFromSlippage(
  pool,
  halfSuppliedAmount,
  swapSlippage ?? 0.3,
);

// Construct deposit pair from swap output
let depositPair: TDepositMixed;
if (SundaeUtils.isAssetIdsEqual(pool.assetA.assetId, suppliedAsset.metadata.assetId)) {
  depositPair = {
    CoinAAmount: suppliedAsset.subtract(halfSuppliedAmount),  // Remaining half
    CoinBAmount: minReceivable,                               // Swap output
  };
} else {
  depositPair = {
    CoinAAmount: minReceivable,                               // Swap output
    CoinBAmount: suppliedAsset.subtract(halfSuppliedAmount),  // Remaining half
  };
}
```

#### **orderRouteSwap()** (Chained Swaps)
- **Output Type:** Single `AssetAmount` (final swap output)
- **Location:** `packages/core/src/TxBuilders/TxBuilder.V3.class.ts:675-795`
- **Process:**
  1. SwapA: assetX → assetY
  2. SwapB: assetY → assetZ
- **Returns:** Final asset (assetZ)

**Example:**
```typescript
// User swaps ADA → SUNDAE → RBERRY (routed through two pools)
orderRouteSwap({
  ownerAddress: "addr1...",
  swapA: {
    pool: adaSundaePool,
    suppliedAsset: new AssetAmount(100_000_000n, ADA_METADATA),
    minReceivable: new AssetAmount(450_000_000n, SUNDAE_METADATA),
  },
  swapB: {
    pool: sundaeRberryPool,
    minReceivable: new AssetAmount(1000_000_000n, RBERRY_METADATA),
  }
})
// Output: AssetAmount(W, RBERRY_METADATA)
```

**Internal Chaining Logic (lines 699-724):**
```typescript
// Calculate swapA output
const [aReserve, bReserve] = SundaeUtils.sortSwapAssetsWithAmounts([
  new AssetAmount(args.swapA.pool.liquidity.aReserve, args.swapA.pool.assetA),
  new AssetAmount(args.swapA.pool.liquidity.bReserve, args.swapA.pool.assetB),
]);

const aOutputAsset =
  swapA.suppliedAsset.metadata.assetId === aReserve.metadata.assetId
    ? bReserve.withAmount(swapA.minReceivable.amount)  // Output is assetB
    : aReserve.withAmount(swapA.minReceivable.amount); // Output is assetA

// Use swapA output as swapB input
const swapB = new SwapConfig({
  ...args.swapB,
  suppliedAsset: aOutputAsset,  // ← Chained output becomes next input
  // ...
}).buildArgs();
```

---

## 2. Current Chaining Patterns

### 2.1 Manual Output Calculation
All existing chained operations manually calculate intermediate outputs using pool math:

```typescript
// From orderRouteSwap (lines 699-713)
const [aReserve, bReserve] = SundaeUtils.sortSwapAssetsWithAmounts([...]);

// Determine which asset is received from swapA
const aOutputAsset =
  swapA.suppliedAsset.metadata.assetId === aReserve.metadata.assetId
    ? bReserve.withAmount(swapA.minReceivable.amount)
    : aReserve.withAmount(swapA.minReceivable.amount);

// Use that output for swapB
const swapB = new SwapConfig({
  suppliedAsset: aOutputAsset,  // ← Intermediate output
  // ...
});
```

### 2.2 Datum-Based Chaining (Zap Pattern)
For operations that execute on-chain sequentially, the builder encodes the downstream datum hash:

```typescript
// From zap (lines 1279-1320)
// Build deposit datum with expected assets from swap
const depositData = this.datumBuilder.buildDepositDatum({
  order: {
    assetA: depositPair.CoinAAmount,
    assetB: depositPair.CoinBAmount,
  },
  // ...
});

// Attach deposit datum hash to swap order
const { inline } = this.datumBuilder.buildSwapDatum({
  destinationAddress: {
    address: await this.generateScriptAddress("order.spend", ...),
    datum: { type: EDatumType.HASH, value: depositData.hash },  // ← Chained datum
  },
  order: { offered: halfSuppliedAmount, minReceived: minReceivable },
  // ...
});
```

**This means:** The swap order's destination is the order script address **with the deposit datum attached**, so when the swap executes, its output goes directly into the deposit order.

---

## 3. Pool Math & Output Estimation

### 3.1 Swap Output Calculation
**Location:** `packages/core/src/Utilities/SundaeUtils.class.ts:540-582`

```typescript
static getSwapOutput(
  poolData: IPoolData,
  suppliedAsset: AssetAmount<IAssetAmountMetadata>,
): TGenericSwapOutcome {
  const inputReserve = poolData.assetA.assetId === suppliedAsset.metadata.assetId
    ? poolData.liquidity.aReserve
    : poolData.liquidity.bReserve;

  const outputReserve = poolData.assetA.assetId === suppliedAsset.metadata.assetId
    ? poolData.liquidity.bReserve
    : poolData.liquidity.aReserve;

  switch (poolData.version) {
    case EContractVersion.V1:
    case EContractVersion.V3:
    case EContractVersion.NftCheck:
      return ConstantProductPool.getSwapOutput(
        suppliedAsset.metadata,
        suppliedAsset.amount,
        inputReserve,
        outputReserve,
        poolData.currentFee,
        false,
      );

    case EContractVersion.Stableswaps:
      return StableSwapsPool.getSwapOutput(
        poolData.assetA.assetId === suppliedAsset.metadata.assetId
          ? poolData.assetB
          : poolData.assetA,
        suppliedAsset.amount,
        inputReserve,
        outputReserve,
        poolData.currentFee,
        poolData.protocolFee ?? 0,
        poolData.linearAmplificationFactor ?? 1n,
      );
  }
}
```

**Returns:** `TGenericSwapOutcome` (union of `ConstantProductPool.TSwapOutcome | StableSwapsPool.TSwapOutcome`)
- Both types include: `{ input, output, lpFee, nextInputReserve, nextOutputReserve, priceImpact }`

### 3.2 Deposit LP Calculation
**Constant Product:** `packages/math/src/PoolMath/ConstantProductPool.ts:34-79`
```typescript
export const calculateLiquidity = (
  a: bigint,
  b: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
) => {
  // ... validates and adjusts for ratio ...

  const actualDepositedA = a - aChange;
  const actualDepositedB = b - bChange;
  const newLpTokens = (actualDepositedA * totalLp) / aReserve;
  const newTotalLpTokens = totalLp + newLpTokens;

  return {
    nextTotalLp: newTotalLpTokens,
    generatedLp: newLpTokens,
    shareAfterDeposit: SharedPoolMath.getShare(newLpTokens, newTotalLpTokens),
    bChange,
    aChange,
    actualDepositedA,
    actualDepositedB,
  };
};
```

**Stableswaps:** `packages/math/src/PoolMath/StableSwapsPool.ts:224-258` (similar structure, but no `aChange`/`bChange`)

### 3.3 Withdraw Output Calculation
**Both pool types:** Returns `[assetA_amount, assetB_amount]` tuple

```typescript
// ConstantProductPool.ts:125-133
export const getTokensForLp = (
  lp: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
): SharedPoolMath.TPair => [
  new Fraction(lp * aReserve, totalLp).quotient,
  new Fraction(lp * bReserve, totalLp).quotient,
];
```

**Critical:** This returns a **tuple** (array of two bigints), not a single value.

---

## 4. Proposed Solution Evaluation

### 4.1 Original Proposal (Single Output) ❌ FAILS

```typescript
interface ITaskResult {
  output: AssetAmount;  // ← Cannot represent withdraw's two assets
  fee: bigint;
  pool: IPoolData;
}
```

**Problem:** `withdraw()` must return **two** `AssetAmount` objects. Forcing it into a single field would require:
- Losing one asset (unacceptable)
- Concatenating them into a synthetic multi-asset object (breaks type safety)
- Special-casing withdraw to return something different (breaks uniformity)

---

### 4.2 Recommended Solution: Array-Based Outputs ✅

```typescript
interface ITaskResult {
  outputs: AssetAmount<IAssetAmountMetadata>[];  // ← Array for multi-asset outputs
  fee: AssetAmount<IAssetAmountMetadata>;        // ← Typed fee (not bigint)
  pool: IPoolData;

  // Helper accessors for type-safe single-output consumption
  get output(): AssetAmount<IAssetAmountMetadata> {
    if (this.outputs.length !== 1) {
      throw new Error(`Expected single output, got ${this.outputs.length}`);
    }
    return this.outputs[0];
  }
}

type TaskConfig<T> = T | ((prevResult: ITaskResult) => T);

class BuilderV3 {
  swap(argsOrFn: TaskConfig<{ pool: IPoolData; offered: AssetAmount; slippage: number }>): this;
  deposit(argsOrFn: TaskConfig<{ pool: IPoolData; assetA: AssetAmount; assetB: AssetAmount }>): this;
  withdraw(argsOrFn: TaskConfig<{ pool: IPoolData; lpAmount: AssetAmount }>): this;
  zap(argsOrFn: TaskConfig<{ pool: IPoolData; suppliedAsset: AssetAmount; slippage: number }>): this;
}
```

**Advantages:**
- Handles all operation types uniformly
- Type-safe for single-output operations via `.output` accessor
- Explicit array indexing for multi-output operations
- Future-proof for potential N-output operations

**Usage Examples:**

```typescript
// Single output (swap)
builder
  .swap({ pool, offered: ada100, slippage: 0.01 })
  .swap((prev) => ({
    pool: anotherPool,
    offered: prev.output,  // ← Single output, use accessor
    slippage: 0.01
  }));

// Multi-output (withdraw)
builder
  .withdraw({ pool, lpAmount: lp1000 })
  .swap((prev) => ({
    pool: assetBPool,
    offered: prev.outputs[1],  // ← Swap assetB from withdraw
    slippage: 0.01
  }))
  .deposit((prev) => ({
    pool: finalPool,
    assetA: prev.output,       // ← Swap output
    assetB: /* need to reference withdraw's assetA somehow */
  }));
```

**Challenge:** How to reference **earlier** task results when current task only sees previous result? This requires task context tracking (see Section 5.3).

---

### 4.3 Alternative: Operation-Specific Result Interfaces ⚠️ Complex

```typescript
interface ISwapResult {
  type: "swap";
  output: AssetAmount;
  fee: AssetAmount;
  pool: IPoolData;
}

interface IWithdrawResult {
  type: "withdraw";
  assetA: AssetAmount;
  assetB: AssetAmount;
  fee: AssetAmount;
  pool: IPoolData;
}

interface IDepositResult {
  type: "deposit";
  lpTokens: AssetAmount;
  fee: AssetAmount;
  pool: IPoolData;
}

type ITaskResult = ISwapResult | IWithdrawResult | IDepositResult;

type TaskConfig<T, R extends ITaskResult> = T | ((prevResult: R) => T);
```

**Advantages:**
- Maximum type safety (TS knows exact return shape per operation)
- Explicit field names (e.g., `assetA`, `assetB` instead of `outputs[0]`, `outputs[1]`)

**Disadvantages:**
- Complex generic constraints for chaining
- Harder to extend (every new operation needs new result type)
- Type narrowing required for consumers: `if (prev.type === "withdraw") { ... }`

**Verdict:** Over-engineered for the current use case. The array-based approach with helper accessors is simpler and equally safe.

---

### 4.4 Alternative: Discriminated Union with Shared Base ⚠️ Middle Ground

```typescript
interface ITaskResultBase {
  fee: AssetAmount;
  pool: IPoolData;
}

interface ISingleOutputResult extends ITaskResultBase {
  outputType: "single";
  output: AssetAmount;
}

interface IMultiOutputResult extends ITaskResultBase {
  outputType: "multi";
  outputs: AssetAmount[];
}

type ITaskResult = ISingleOutputResult | IMultiOutputResult;
```

**Advantages:**
- Type-safe discrimination via `outputType`
- Cleaner than fully separate interfaces

**Disadvantages:**
- Still requires type narrowing: `if (prev.outputType === "single") { ... }`
- Less ergonomic than array-based with accessor

**Verdict:** Viable, but the array-based approach is more uniform.

---

## 5. Edge Cases & Complex Chaining Scenarios

### 5.1 Withdraw → Split → Two Separate Operations

**Scenario:** Withdraw LP tokens, swap assetA, deposit assetB + swap output into different pool.

```typescript
builder
  .withdraw({ pool: poolAB, lpAmount: lp1000 })
  // Want to:
  // 1. Swap outputs[0] (assetA) → assetC
  // 2. Deposit outputs[1] (assetB) + assetC → poolBC
```

**Problem:** The chaining function only sees `prevResult`. To reference withdraw's outputs in the deposit step, we need:
- Either: Store all task results in builder context
- Or: Allow multi-step lookahead in chaining functions

**Solution A: Context-Aware Chaining**
```typescript
type TaskConfig<T> = T | ((ctx: {
  prev: ITaskResult;           // Previous task result
  all: ITaskResult[];          // All previous task results
  getTask: (index: number) => ITaskResult;  // Access any task by index
}) => T);

// Usage:
builder
  .withdraw({ pool: poolAB, lpAmount: lp1000 })  // Task 0
  .swap(({ prev }) => ({                         // Task 1
    pool: poolAC,
    offered: prev.outputs[0],  // assetA
    slippage: 0.01
  }))
  .deposit(({ prev, getTask }) => ({             // Task 2
    pool: poolBC,
    assetA: getTask(0).outputs[1],  // Withdraw's assetB
    assetB: prev.output              // Swap's assetC
  }));
```

**Solution B: Named Task References**
```typescript
builder
  .withdraw({ pool: poolAB, lpAmount: lp1000 }, { name: "withdrawLP" })
  .swap(({ prev }) => ({
    pool: poolAC,
    offered: prev.outputs[0],
    slippage: 0.01
  }), { name: "swapToC" })
  .deposit(({ tasks }) => ({
    pool: poolBC,
    assetA: tasks.withdrawLP.outputs[1],
    assetB: tasks.swapToC.output
  }));
```

---

### 5.2 Partial Output Consumption

**Scenario:** Withdraw 1000 LP → get 100 ADA + 500 SUNDAE. Swap only 50 SUNDAE, keep rest.

```typescript
builder
  .withdraw({ pool, lpAmount: lp1000 })
  .swap(({ prev }) => ({
    pool: sundaeRberryPool,
    offered: prev.outputs[1].withAmount(50_000_000n),  // Only 50 SUNDAE
    slippage: 0.01
  }));
```

**Question:** What happens to the remaining 450 SUNDAE? The builder doesn't "return" unused outputs—it only constructs transactions. The **user's wallet** receives all outputs not explicitly consumed by subsequent operations.

**Design Decision:** The builder should:
1. **Not track** "remaining" outputs (wallet handles this)
2. Allow explicit `.withAmount()` calls to consume partial amounts
3. Document that unconsumed outputs go to `ownerAddress`

---

### 5.3 Circular Dependencies (Invalid)

**Scenario:** Task A depends on Task B's output, Task B depends on Task A's output.

```typescript
// INVALID: Cannot compile
builder
  .swap(({ getTask }) => ({
    pool: poolAB,
    offered: getTask(1).output,  // ← References task 1 (below)
    slippage: 0.01
  }))
  .swap(({ prev }) => ({
    pool: poolBC,
    offered: prev.output,  // ← References task 0 (above)
    slippage: 0.01
  }));
```

**Solution:** Runtime validation in builder:
```typescript
private validateNoCycles(tasks: Task[]): void {
  tasks.forEach((task, index) => {
    if (task.config instanceof Function) {
      // Detect if function references any task >= current index
      // (This requires AST analysis or runtime tracking)
      const referencedIndices = this.getReferencedTaskIndices(task.config);
      if (referencedIndices.some(i => i >= index)) {
        throw new Error(`Task ${index} creates a forward reference (cycle detected)`);
      }
    }
  });
}
```

---

### 5.4 Conditional Chaining

**Scenario:** If withdraw returns more than X ADA, zap it; otherwise, just hold.

```typescript
builder
  .withdraw({ pool, lpAmount: lp1000 })
  .conditionally(({ prev }) => prev.outputs[0].amount > 50_000_000n, (b) =>
    b.zap({ pool: anotherPool, suppliedAsset: prev.outputs[0], slippage: 0.01 })
  );
```

**Implementation:** Builder supports `.conditionally()` method that skips the nested tasks if condition is false.

---

## 6. Fee Tracking

### 6.1 Current Fee Structure
From `packages/core/src/@types/txbuilders.ts:13-19`:

```typescript
export interface ITxBuilderFees {
  cardanoTxFee?: AssetAmount<IAssetAmountMetadata>;  // Network fee
  deposit: AssetAmount<IAssetAmountMetadata>;         // Min ADA in order UTXO
  liquidity?: AssetAmount<IAssetAmountMetadata>;      // LP fee (from pool)
  referral?: AssetAmount<IAssetAmountMetadata>;       // Optional referral fee
  scooperFee: AssetAmount<IAssetAmountMetadata>;      // Batching service fee
}
```

### 6.2 Per-Operation Fees

| Operation | cardanoTxFee | deposit | liquidity | referral | scooperFee |
|-----------|--------------|---------|-----------|----------|------------|
| swap      | ✓ (calculated) | ✓ (ORDER_DEPOSIT_DEFAULT) | ✓ (from pool) | ✓ (optional) | ✓ (from settings UTXO) |
| deposit   | ✓ | ✓ | ✗ | ✓ | ✓ |
| withdraw  | ✓ | ✓ | ✗ | ✓ | ✓ |
| zap       | ✓ | ✓ | ✓ (2x, swap + deposit) | ✓ | ✓ (2x, two orders) |
| orderRouteSwap | ✓ | ✓ (2x, ORDER_ROUTE_DEPOSIT_DEFAULT) | ✓ (2x, both swaps) | ✓ | ✓ (2x, two orders) |

**Key Insight:** Compound operations (zap, orderRouteSwap) **accumulate** fees from constituent operations.

### 6.3 Fee Accumulation in Builder V3

**Proposed Change:** `ITaskResult.fee` should be:
```typescript
interface ITaskResult {
  outputs: AssetAmount[];
  fees: ITxBuilderFees;  // ← Full fee breakdown, not just bigint
  pool: IPoolData;
}
```

**Reason:** Dynamic chaining needs to know:
- How much scooperFee was consumed (to calculate remaining balance)
- Whether liquidity fees were applied (affects price impact)
- Total deposit requirements (to ensure sufficient ADA in wallet)

---

## 7. Recommended Implementation Plan

### Phase 1: Core Interface Design
```typescript
// File: packages/core/src/@types/builder-v3.ts
export interface ITaskResult {
  outputs: AssetAmount<IAssetAmountMetadata>[];
  fees: ITxBuilderFees;
  pool: IPoolData;

  // Convenience accessor for single-output operations
  get output(): AssetAmount<IAssetAmountMetadata> {
    if (this.outputs.length !== 1) {
      throw new Error(
        `Expected single output, got ${this.outputs.length}. ` +
        `Use .outputs[] array for multi-output operations.`
      );
    }
    return this.outputs[0];
  }
}

export interface ITaskContext {
  prev: ITaskResult;
  all: ITaskResult[];
  getTask: (index: number) => ITaskResult;
}

export type TaskConfig<T> = T | ((ctx: ITaskContext) => T);
```

### Phase 2: Operation Result Builders
```typescript
// File: packages/core/src/Builders/TaskResultBuilder.ts
export class TaskResultBuilder {
  static fromSwap(outcome: TGenericSwapOutcome, outputMetadata: IAssetAmountMetadata, fees: ITxBuilderFees, pool: IPoolData): ITaskResult {
    return {
      outputs: [new AssetAmount(outcome.output, outputMetadata)],
      fees,
      pool,
      get output() { return this.outputs[0]; }
    };
  }

  static fromDeposit(generatedLp: bigint, lpMetadata: IAssetAmountMetadata, fees: ITxBuilderFees, pool: IPoolData): ITaskResult {
    return {
      outputs: [new AssetAmount(generatedLp, lpMetadata)],
      fees,
      pool,
      get output() { return this.outputs[0]; }
    };
  }

  static fromWithdraw(
    [assetA, assetB]: [bigint, bigint],
    assetAMetadata: IAssetAmountMetadata,
    assetBMetadata: IAssetAmountMetadata,
    fees: ITxBuilderFees,
    pool: IPoolData
  ): ITaskResult {
    return {
      outputs: [
        new AssetAmount(assetA, assetAMetadata),
        new AssetAmount(assetB, assetBMetadata),
      ],
      fees,
      pool,
      get output() {
        throw new Error("withdraw() returns multiple outputs. Use .outputs[0] and .outputs[1] instead.");
      }
    };
  }
}
```

### Phase 3: Builder Implementation
```typescript
// File: packages/core/src/Builders/BuilderV3.class.ts
export class BuilderV3 {
  private tasks: Array<{ type: string; config: any; result?: ITaskResult }> = [];

  swap(argsOrFn: TaskConfig<ISwapConfigArgs>): this {
    this.tasks.push({ type: "swap", config: argsOrFn });
    return this;
  }

  deposit(argsOrFn: TaskConfig<IDepositConfigArgs>): this {
    this.tasks.push({ type: "deposit", config: argsOrFn });
    return this;
  }

  withdraw(argsOrFn: TaskConfig<IWithdrawConfigArgs>): this {
    this.tasks.push({ type: "withdraw", config: argsOrFn });
    return this;
  }

  zap(argsOrFn: TaskConfig<IZapConfigArgs>): this {
    this.tasks.push({ type: "zap", config: argsOrFn });
    return this;
  }

  async build(): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const results: ITaskResult[] = [];

    for (const task of this.tasks) {
      const config = typeof task.config === "function"
        ? task.config({
            prev: results[results.length - 1],
            all: results,
            getTask: (index) => results[index],
          })
        : task.config;

      const result = await this.executeTask(task.type, config);
      results.push(result);
      task.result = result;
    }

    // Merge all transactions into final composed TX
    return this.mergeTransactions(this.tasks);
  }

  private async executeTask(type: string, config: any): Promise<ITaskResult> {
    switch (type) {
      case "swap": {
        const outcome = SundaeUtils.getSwapOutput(config.pool, config.offered);
        const outputMetadata = /* determine opposite asset */;
        const fees = /* calculate fees */;
        return TaskResultBuilder.fromSwap(outcome, outputMetadata, fees, config.pool);
      }
      case "withdraw": {
        const [assetA, assetB] = ConstantProductPool.getTokensForLp(
          config.lpAmount.amount,
          config.pool.liquidity.aReserve,
          config.pool.liquidity.bReserve,
          config.pool.liquidity.lpTokens,
        );
        const fees = /* calculate fees */;
        return TaskResultBuilder.fromWithdraw(
          [assetA, assetB],
          config.pool.assetA,
          config.pool.assetB,
          fees,
          config.pool
        );
      }
      // ... other operations
    }
  }
}
```

### Phase 4: Testing Strategy
1. **Unit Tests:** Each operation's result builder
   - `TaskResultBuilder.fromSwap()` returns correct single output
   - `TaskResultBuilder.fromWithdraw()` returns correct two outputs
   - `.output` accessor throws on multi-output results

2. **Integration Tests:** Chaining scenarios
   - Swap → Swap (single output chaining)
   - Withdraw → Swap (multi-output → single-input)
   - Withdraw → Swap + Deposit (split multi-output)

3. **E2E Tests:** Against testnet
   - Full zap operation
   - Order route swap
   - Withdraw → immediate re-deposit

---

## 8. Migration Path from Existing Builders

### Current Builder (TxBuilderV3)
- Returns `IComposedTx<BlazeTx, Core.Transaction>` immediately
- Each operation is independent (no chaining)
- Users must manually calculate intermediate outputs

### New Builder (BuilderV3)
- Accumulates tasks, executes on `.build()`
- Returns same `IComposedTx` structure (compatible)
- Handles intermediate output calculations automatically

**Compatibility Layer:**
```typescript
// Existing code still works:
const result = await txBuilder.swap({ pool, offered, slippage });
await result.build().then(tx => tx.sign()).then(signed => signed.submit());

// New chaining API:
const result = await new BuilderV3()
  .swap({ pool1, offered, slippage })
  .swap((prev) => ({ pool2, offered: prev.output, slippage }))
  .build();  // ← Same IComposedTx<> return type
```

---

## 9. Open Questions & Future Work

### 9.1 Parallel Operations
**Question:** Should the builder support parallel execution (e.g., two independent swaps)?

```typescript
builder
  .parallel([
    (b) => b.swap({ pool: poolA, offered: ada100, slippage: 0.01 }),
    (b) => b.swap({ pool: poolB, offered: sundae500, slippage: 0.01 }),
  ])
  .deposit(({ prev }) => ({
    pool: poolC,
    assetA: prev[0].output,  // First swap output
    assetB: prev[1].output,  // Second swap output
  }));
```

**Impact:** `ITaskResult` would need to support "parallel result sets" (array of arrays?).

### 9.2 Slippage Accumulation
**Question:** When chaining swaps, should slippage compound or apply independently?

**Example:**
- Swap1: 1% slippage → expect >= 99 SUNDAE
- Swap2: 1% slippage on output → expect >= 98.01 RBERRY (compounded)

**Current Behavior:** Each swap applies slippage independently (user specifies `minReceivable` for each).

**Proposal:** Add `.withAccumulatedSlippage(0.02)` to compound slippage across chain.

### 9.3 Gas Estimation
**Question:** Can we estimate total Cardano TX fee before execution?

**Challenge:** Fees depend on:
- Transaction size (number of inputs/outputs)
- Script execution costs (redeemers, datums)
- Collateral requirements

**Proposal:** Add `.estimateFees(): Promise<ITxBuilderFees>` that dry-runs all operations without submitting.

### 9.4 Rollback Handling
**Question:** If Task 3 fails (insufficient liquidity), should Tasks 1-2 be reverted?

**Current Behavior:** Each TxBuilder operation is independent—no rollback needed (all or nothing per tx).

**New Behavior:** BuilderV3 creates **one merged transaction** containing all operations, so it's still atomic (all or nothing).

---

## 10. Conclusion

### Summary of Findings

1. **Multi-Asset Outputs Are Real:** The `withdraw()` operation definitively returns two assets, invalidating single-output designs.

2. **Array-Based Solution Is Optimal:** Using `outputs: AssetAmount[]` with a helper `.output` accessor provides:
   - Uniform handling across all operation types
   - Type-safe single-output consumption
   - Explicit multi-output indexing
   - Future extensibility

3. **Context-Aware Chaining Is Necessary:** To support complex patterns (e.g., withdraw → split outputs into two operations), the chaining function needs access to **all previous results**, not just the immediate predecessor.

4. **Fee Tracking Must Be Comprehensive:** Replace `fee: bigint` with `fees: ITxBuilderFees` to support accurate cost estimation and balance checks.

5. **Existing Patterns Are Compatible:** The new builder can coexist with current `TxBuilderV3` methods, maintaining backward compatibility.

### Recommendation

**Proceed with the array-based `ITaskResult` design**, incorporating:
- `outputs: AssetAmount[]` for flexibility
- `.output` accessor for ergonomics
- Context-aware chaining (`ITaskContext` with `.prev`, `.all`, `.getTask()`)
- Full fee breakdown (`ITxBuilderFees` instead of `bigint`)

### Next Steps

1. Prototype `TaskResultBuilder` with all operation types
2. Implement context-aware chaining in `BuilderV3.build()`
3. Write integration tests for withdraw → split patterns
4. Validate against existing TxBuilder test suites
5. Document chaining best practices and edge cases

---

**End of Report**
