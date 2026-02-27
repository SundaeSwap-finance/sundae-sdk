# SundaeSwap SDK Refactoring: Implementation Plan

**Version:** 0.1.0 (Major Rewrite)
**Target Package:** `@sundaeswap/sdk` (deprecates `@sundaeswap/core`)
**Date:** 2026-02-26
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a step-by-step implementation plan for refactoring the SundaeSwap SDK from monolithic, version-specific transaction builders to a composable, chainable architecture that supports:

1. **Arbitrary-length transaction chains** with **result-aware chaining** (swap → swap → deposit → withdraw)
2. **Cross-contract-version operations** (V1 → V3 → V1 routes)
3. **Multi-asset output handling** (withdraw returns assetA + assetB)
4. **Optional third-party protocol integration** via `IOperation` extraction interface

The refactor is guided by six comprehensive analyses:
- **Internal Developer Perspective** (`analysis/sundaeswap-perspective.md`)
- **Third-Party Integrator Perspective** (`analysis/integrator-perspective.md`)
- **Protocol-Agnostic Perspective** (`analysis/protocol-agnostic-perspective.md`)
- **Serialization Layer Feasibility** (`analysis/serialization-feasibility.md`)
- **Builder Layer Feasibility** (`analysis/builder-feasibility.md`)
- **Composer Layer Feasibility** (`analysis/composer-feasibility.md`)

---

## Core Architecture Changes

### Current Architecture (Before)

```
SundaeSDK
  └── builder(EContractVersion.V3)
        └── TxBuilderV3
              ├── swap(ISwapConfigArgs) → IComposedTx
              ├── deposit(IDepositConfigArgs) → IComposedTx
              ├── orderRouteSwap(IOrderRouteSwapArgs) → IComposedTx  ← Hardcoded
              ├── migrateLiquidity(IMigrateLiquidityArgs) → IComposedTx  ← Hardcoded
              └── zap(IZapArgs) → IComposedTx  ← Hardcoded
```

**Problems:**
- Every new transaction pattern requires a new hardcoded method
- 385-line `migrateLiquidity()` method with manual datum coordination
- Cross-version operations require manual builder instantiation
- Cannot chain with external protocols (Liqwid, Minswap)

---

### Target Architecture (After)

```
@sundaeswap/sdk (SundaeSwap-First Architecture)
  ├── Serialization Layer (Datum Construction)
  │     ├── SerializationV1
  │     └── SerializationV3
  │     Note: Returns TDatumResult<Schema> for datum chaining
  │
  ├── Builder Layer (Chainable with Result-Aware Config)
  │     ├── BuilderV1
  │     └── BuilderV3
  │     Note: Supports function-based config with ITaskContext
  │
  ├── Composer Layer (Cross-Version, uses Blaze internally)
  │     └── Composer
  │     Note: Builds datums in reverse, handles V1↔V3 transitions
  │
  └── Optional Extension Layer (for third-party integration)
        └── IOperation extraction interface
```

**Benefits:**
- Arbitrary transaction chains without hardcoded methods
- Datum construction decoupled from transaction building
- Protocol-agnostic interfaces for third-party integration
- Backward compatibility via facade methods

---

## Implementation Phases

### Phase 1: Serialization Layer (Weeks 1-2)

**Goal:** Separate datum construction from transaction building.

#### 1.1 Create SerializationV1

**Location:** `packages/sdk/src/Serialization/SerializationV1.class.ts`

**Interface:**
```typescript
export class SerializationV1 {
  /**
   * Build a swap datum for V1 contracts.
   * @returns TDatumResult with hash, inline CBOR, and schema
   */
  buildSwapDatum(args: {
    pool: IPoolData;
    offered: AssetAmount<IAssetAmountMetadata>;
    minReceived: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;  // Supports datum chaining
    alternateAddress?: string;  // V1 cancellation authority
    scooperFee: bigint;
  }): TDatumResult<V1Types.SwapOrder>;

  buildDepositDatum(args: {
    pool: IPoolData;
    assetA: AssetAmount<IAssetAmountMetadata>;
    assetB: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    alternateAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V1Types.DepositOrder>;

  buildWithdrawDatum(args: {
    pool: IPoolData;
    lpAmount: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    alternateAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V1Types.WithdrawOrder>;
}
```

**Critical Design Decision: Return `TDatumResult<Schema>`, NOT `string`**

**Reason:** Datum chaining requires the hash BEFORE constructing parent datums:
```typescript
// Step 1: Build deposit datum
const depositDatum = serializer.buildDepositDatum({...});

// Step 2: Use hash in swap datum's destination
const swapDatum = serializer.buildSwapDatum({
  destinationAddress: {
    address: orderScriptAddress,
    datum: {
      type: EDatumType.HASH,
      value: depositDatum.hash,  // ← REQUIRED for chaining
    },
  },
  // ...
});
```

**Migration Path:**
- Extract logic from `DatumBuilderV1.buildSwapDatum()` (lines 139-168)
- Preserve `TDatumResult` return type (critical for chaining)
- Add `TDestinationAddress` parameter (supports datum: NONE, HASH, INLINE)
- Keep V1Types internal to serialization layer

**Testing:**
```typescript
describe("SerializationV1", () => {
  it("should build valid swap datum with chaining", () => {
    const serializer = new SerializationV1();

    // Build destination datum first
    const depositDatum = serializer.buildDepositDatum({
      pool: MOCK_V1_POOL,
      assetA: new AssetAmount(50_000_000n, ADA_METADATA),
      assetB: new AssetAmount(500_000_000n, INDY_METADATA),
      destinationAddress: { address: "addr_test1...", datum: { type: EDatumType.NONE } },
      scooperFee: 1_000_000n,
    });

    // Build swap datum that chains to deposit
    const swapDatum = serializer.buildSwapDatum({
      pool: MOCK_V1_POOL,
      offered: new AssetAmount(100_000_000n, ADA_METADATA),
      minReceived: new AssetAmount(500_000_000n, INDY_METADATA),
      destinationAddress: {
        address: ORDER_SCRIPT_ADDRESS,
        datum: { type: EDatumType.HASH, value: depositDatum.hash },
      },
      scooperFee: 1_000_000n,
    });

    expect(swapDatum.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(swapDatum.inline).toMatch(/^d8799f/);
    expect(swapDatum.schema.orderAddresses.destination.datum).toBe(depositDatum.hash);
  });
});
```

---

#### 1.2 Create SerializationV3

**Location:** `packages/sdk/src/Serialization/SerializationV3.class.ts`

**Interface:**
```typescript
export class SerializationV3 {
  buildSwapDatum(args: {
    pool: IPoolData;
    offered: AssetAmount<IAssetAmountMetadata>;
    minReceived: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;  // Supports NONE, HASH, INLINE
    ownerAddress?: string;  // Defaults to destinationAddress
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  buildDepositDatum(args: {
    pool: IPoolData;
    assetA: AssetAmount<IAssetAmountMetadata>;
    assetB: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  buildWithdrawDatum(args: {
    pool: IPoolData;
    lpAmount: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  buildStrategyDatum(args: {
    pool: IPoolData;
    destination: TDestination;  // FIXED or SELF
    ownerAddress: string;  // REQUIRED for strategy
    authorization: { signer: string } | { script: string };
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;
}
```

**Critical V3 Requirements:**

1. **Owner Address (Staking Credential Inheritance)**
   - Defaults to `destinationAddress` if not provided
   - Used for authorization and staking rewards
   - Stored as `MultisigScript` (Signature or Script variant)

2. **Extension Field**
   - All V3 datums include `extension: VOID_BYTES`
   - Required for protocol compatibility
   - Currently unused but must be present

3. **Destination Datum Chaining**
   ```typescript
   destinationAddress: {
     address: string;
     datum: {
       type: EDatumType.NONE | EDatumType.HASH | EDatumType.INLINE;
       value?: string;  // Hash or inline CBOR
     };
   }
   ```

**Datum Chaining Example:**
```typescript
// Step 1: Build second swap datum (destination)
const secondDatum = serializerV3.buildSwapDatum({
  pool: POOL_B,
  offered: new AssetAmount(50_000_000n, INDY_METADATA),
  minReceived: new AssetAmount(0.1 * 10**6, BTC_METADATA),
  destinationAddress: {
    address: "addr_test1...",
    datum: { type: EDatumType.NONE },
  },
  scooperFee: 1_000_000n,
});

// Step 2: Build first swap datum that references second
const firstDatum = serializerV3.buildSwapDatum({
  pool: POOL_A,
  offered: new AssetAmount(100_000_000n, ADA_METADATA),
  minReceived: new AssetAmount(50_000_000n, INDY_METADATA),
  destinationAddress: {
    address: ORDER_SCRIPT_ADDRESS,
    datum: {
      type: EDatumType.INLINE,  // V3 supports inline
      value: secondDatum.inline,  // ← Reference second datum
    },
  },
  scooperFee: 1_000_000n,
});
```

**Migration Path:**
- Extract from `DatumBuilderV3.buildSwapDatum()` (lines 139-168)
- Preserve `TDatumResult` return type (required for chaining)
- Include `ownerAddress` and `extension` fields
- Support all three destination datum types (NONE, HASH, INLINE)
- Keep V3Types internal

---

### Phase 2: Builder Layer (Weeks 3-5)

**Goal:** Create chainable builders with **result-aware configuration** (dynamic output chaining).

#### 2.1 Core Interfaces

**Location:** `packages/sdk/src/Builders/interfaces.ts`

```typescript
/**
 * Result from a task execution (estimated outputs).
 */
export interface ITaskResult {
  outputs: AssetAmount<IAssetAmountMetadata>[];  // Array for multi-asset outputs
  fees: ITxBuilderFees;  // Full fee breakdown
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

/**
 * Context passed to config functions for result-aware chaining.
 */
export interface ITaskContext {
  prev: ITaskResult;  // Immediate predecessor result
  all: ITaskResult[];  // All previous task results
  getTask: (index: number) => ITaskResult;  // Access specific task
}

/**
 * Task configuration: static or dynamic (function of previous results).
 */
export type TaskConfig<T> = T | ((ctx: ITaskContext) => T);

/**
 * Internal task representation.
 */
export interface ITask {
  type: "swap" | "deposit" | "withdraw" | "strategy";
  pool: IPoolData;
  config: any;  // Resolved configuration
  datum: () => TDatumResult<unknown>;  // Lazy evaluation
  payment: AssetAmount[];
  estimateOutput: () => AssetAmount[];  // Calculate expected outputs
}
```

**Why Array-Based Outputs:**
- **swap()**: Returns `[outputAsset]` (single element)
- **deposit()**: Returns `[lpTokens]` (single element)
- **withdraw()**: Returns `[assetA, assetB]` (TWO elements)
- **zap()**: Returns `[lpTokens]` (compound operation, single output)

---

#### 2.2 BuilderV1 Implementation

**Location:** `packages/sdk/src/Builders/BuilderV1.class.ts`

**Core Pattern:**
```typescript
export class BuilderV1 {
  private tasks: ITask[] = [];
  private serializer = new SerializationV1();

  /**
   * Add a swap step with result-aware configuration.
   */
  swap(argsOrFn: TaskConfig<{
    pool: IPoolData;
    offered: AssetAmount<IAssetAmountMetadata>;
    slippage: number;
  }>): this {
    // Resolve configuration from previous results if function provided
    const args = typeof argsOrFn === 'function'
      ? argsOrFn(this.buildTaskContext())
      : argsOrFn;

    const minReceived = SundaeUtils.getMinReceivableFromSlippage(
      args.pool,
      args.offered,
      args.slippage
    );

    this.tasks.push({
      type: "swap",
      pool: args.pool,
      config: { offered: args.offered, minReceived },
      datum: () => this.serializer.buildSwapDatum({
        pool: args.pool,
        offered: args.offered,
        minReceived,
        destinationAddress: this.getNextTaskDestination(),  // Resolved by Composer
        scooperFee: this.getScooperFee(),
      }),
      payment: this.calculatePayment(args.offered),
      estimateOutput: () => {
        const outcome = SundaeUtils.getSwapOutput(args.pool, args.offered);
        const outputMetadata = this.getOppositeAsset(args.pool, args.offered);
        return [new AssetAmount(outcome.output, outputMetadata)];
      },
    });

    return this;
  }

  withdraw(argsOrFn: TaskConfig<{
    pool: IPoolData;
    lpAmount: AssetAmount<IAssetAmountMetadata>;
  }>): this {
    const args = typeof argsOrFn === 'function'
      ? argsOrFn(this.buildTaskContext())
      : argsOrFn;

    this.tasks.push({
      type: "withdraw",
      pool: args.pool,
      config: { lpAmount: args.lpAmount },
      datum: () => this.serializer.buildWithdrawDatum({
        pool: args.pool,
        lpAmount: args.lpAmount,
        destinationAddress: this.getNextTaskDestination(),
        scooperFee: this.getScooperFee(),
      }),
      payment: this.calculatePayment(args.lpAmount),
      estimateOutput: () => {
        // MULTI-ASSET OUTPUT
        const [assetA, assetB] = ConstantProductPool.getTokensForLp(
          args.lpAmount.amount,
          args.pool.liquidity.aReserve,
          args.pool.liquidity.bReserve,
          args.pool.liquidity.lpTotal
        );
        return [
          new AssetAmount(assetA, args.pool.assetA),
          new AssetAmount(assetB, args.pool.assetB),
        ];
      },
    });

    return this;
  }

  /**
   * Build context for config functions.
   */
  private buildTaskContext(): ITaskContext {
    const allResults = this.tasks.map(t => this.buildTaskResult(t));

    return {
      prev: allResults[allResults.length - 1],
      all: allResults,
      getTask: (index: number) => allResults[index],
    };
  }

  /**
   * Build result for a task (pre-execution estimation).
   */
  private buildTaskResult(task: ITask): ITaskResult {
    const outputs = task.estimateOutput();
    return {
      outputs,
      fees: this.calculateTaskFees(task),
      pool: task.pool,
      get output() {
        if (outputs.length !== 1) {
          throw new Error(`Expected single output, got ${outputs.length}`);
        }
        return outputs[0];
      },
    };
  }

  getTasks(): ITask[] {
    return this.tasks;
  }
}
```

**Result-Aware Chaining Examples:**

```typescript
// Example 1: Swap → Swap (use previous output)
builder
  .swap({ pool: POOL_ADA_INDY, offered: ADA_100, slippage: 0.03 })
  .swap(({ prev }) => ({
    pool: POOL_INDY_BTC,
    offered: prev.output,  // ← Dynamic: use estimated INDY output
    slippage: 0.03
  }));

// Example 2: Withdraw → Swap one asset, keep the other
builder
  .withdraw({ pool: POOL_ADA_INDY, lpAmount: LP_1000 })
  .swap(({ prev }) => ({
    pool: POOL_INDY_BTC,
    offered: prev.outputs[1],  // ← Swap assetB (INDY) from withdraw
    slippage: 0.03
  }));
// Note: prev.outputs[0] (ADA) goes to finalDestination automatically

// Example 3: Withdraw → Use both assets in deposit
builder
  .withdraw({ pool: POOL_ADA_INDY, lpAmount: LP_1000 })
  .swap(({ prev }) => ({
    pool: POOL_INDY_BTC,
    offered: prev.outputs[1],  // Swap INDY → BTC
    slippage: 0.03
  }))
  .deposit(({ prev, getTask }) => ({
    pool: POOL_ADA_BTC,
    assetA: getTask(0).outputs[0],  // ← ADA from withdraw (task 0)
    assetB: prev.output,             // ← BTC from swap (task 1)
  }));
```

---

#### 2.3 BuilderV3 Interface

**Location:** `packages/sdk/src/Builders/BuilderV3.class.ts`

Similar to V1 but uses `SerializationV3` and supports:
- Inline datums (V3 can use inline, hash, or none)
- Staking credential inheritance via `ownerAddress`
- Strategy orders with authorization

**Cross-Builder Result Passing:**

The Composer handles passing outputs across builder boundaries:

```typescript
const builderV1 = new BuilderV1();
builderV1.swap({ pool: V1_POOL_ADA_INDY, offered: ADA_100, slippage: 0.03 });

const builderV3 = new BuilderV3();
builderV3.swap(({ prev }) => ({
  // prev contains V1's last task result
  pool: V3_POOL_INDY_BTC,
  offered: prev.output,  // ← Cross-builder chaining!
  slippage: 0.03
}));

const composer = new Composer("addr_test1...", [builderV1, builderV3]);
```

**Implementation Note:**
- Composer injects `ITaskContext` when evaluating config functions
- `prev` refers to the **last task in the previous builder** when crossing boundaries
- `getTask(0)` can access first builder's first task from second builder's context

---

### Phase 3: Composer Layer (Weeks 6-8)

**Goal:** Bundle multiple builders into a single transaction with **reverse-order datum resolution**.

#### 3.1 Composer Interface

**Location:** `packages/sdk/src/Composers/Composer.class.ts`

**Core Responsibility:**
- Accept multiple `BuilderV1` and `BuilderV3` instances
- Merge their tasks into a single Blaze transaction
- Handle datum chaining across builders (V1 ↔ V3 transitions)
- Build datums in **reverse order** (destination first, source last)
- Attach metadata for V1 compatibility (label 103251n)
- Calculate total fees (scooper fees + deposits + referral fees)
- Return `IComposedTx` for signing/submission

**Critical Implementation Detail: Reverse-Order Datum Building**

From analysis of `migrateLiquidityToV3()` and `zap()`, datums MUST be built in reverse order:
```typescript
// 1. Build V3 deposit datum FIRST (to get its hash)
const depositDatum = v3Serializer.buildDepositDatum({...});

// 2. Build V1 withdraw datum with V3's hash as destination
const withdrawDatum = v1Serializer.buildWithdrawDatum({
  destinationAddress: {
    address: v3OrderScriptAddress,
    datum: { type: EDatumType.HASH, value: depositDatum.hash },
  },
  // ...
});
```

**Interface:**

```typescript
export class Composer {
  constructor(
    private finalDestination: string,
    private builders: Array<BuilderV1 | BuilderV3>,
  ) {}

  /**
   * Build the complete transaction from all builders.
   */
  async build(): Promise<IComposedTx> {
    // 1. Collect all tasks from all builders
    const allTasks = this.builders.flatMap(b => b.getTasks());

    // 2. Resolve output chaining (connect task outputs to next task inputs)
    this.resolveOutputChain(allTasks);

    // 3. Build datums in REVERSE order (destination first)
    const resolvedDatums = this.buildDatumsReverse(allTasks);

    // 4. Build Blaze transaction
    const tx = this.blaze.newTransaction();

    for (let i = 0; i < allTasks.length; i++) {
      const task = allTasks[i];
      const datum = resolvedDatums[i];
      const scriptAddress = await this.getOrderScriptAddress(task.pool.version);

      tx.provideDatum(Core.PlutusData.fromCbor(Core.HexBlob(datum.inline)))
        .lockAssets(
          Core.addressFromBech32(scriptAddress),
          makeValue(task.payment),
          this.getDatumType(task) === EDatumType.HASH
            ? Core.DatumHash(datum.hash)
            : Core.PlutusData.fromCbor(Core.HexBlob(datum.inline))
        );
    }

    // 5. Attach metadata (V1 compatibility)
    const metadata = this.buildMetadata(resolvedDatums, allTasks);
    if (metadata.size > 0) {
      const data = new Core.AuxiliaryData();
      data.setMetadata(new Core.Metadata(metadata));
      tx.setAuxiliaryData(data);
    }

    // 6. Complete transaction
    const completedTx = await tx.complete({ coinSelection: true });

    return {
      tx: completedTx,
      fees: this.calculateTotalFees(allTasks),
      build: () => this.buildAndSign(completedTx),
    };
  }

  /**
   * Build datums in reverse order (destination first, source last).
   * This is CRITICAL for datum chaining.
   */
  private buildDatumsReverse(tasks: ITask[]): TDatumResult<unknown>[] {
    const datums: TDatumResult<unknown>[] = new Array(tasks.length);

    // Process in REVERSE
    for (let i = tasks.length - 1; i >= 0; i--) {
      const currentTask = tasks[i];
      const nextTask = tasks[i + 1];

      // Build datum for current task
      // Note: task.datum() is lazy and will use resolved destination from previous pass
      datums[i] = currentTask.datum();

      // If next task exists, update current task's destination to reference it
      if (nextTask) {
        const nextDatum = datums[i + 1];
        const nextScriptAddress = this.getOrderScriptAddress(nextTask.pool.version);

        // Update current task's destination address (retroactively)
        currentTask.setDestination({
          address: nextScriptAddress,
          datum: {
            type: this.getDatumType(nextTask),
            value: this.getDatumType(nextTask) === EDatumType.HASH
              ? nextDatum.hash
              : nextDatum.inline,
          },
        });

        // Rebuild current task's datum with updated destination
        datums[i] = currentTask.datum();
      }
    }

    return datums;
  }

  /**
   * Build metadata map for V1 compatibility.
   * Stores hashed datums under label 103251n.
   */
  private buildMetadata(
    datums: TDatumResult<unknown>[],
    tasks: ITask[]
  ): Map<bigint, Core.Metadatum> {
    const metadata = new Map<bigint, Core.Metadatum>();
    const datumMap = new Map<Buffer, Buffer[]>();

    for (let i = 0; i < tasks.length - 1; i++) {
      const nextTask = tasks[i + 1];

      // If next task uses hashed datums, store it in metadata
      if (this.getDatumType(nextTask) === EDatumType.HASH) {
        const nextDatum = datums[i + 1];
        datumMap.set(
          Buffer.from(nextDatum.hash, "hex"),
          SundaeUtils.splitMetadataString(nextDatum.inline).map(v =>
            Buffer.from(v, "hex")
          )
        );
      }
    }

    if (datumMap.size > 0) {
      metadata.set(103251n, Core.Metadatum.fromCore(datumMap));
    }

    return metadata;
  }

  /**
   * Calculate total fees across all tasks.
   */
  private calculateTotalFees(tasks: ITask[]): ITxBuilderFees {
    const totalScooperFee = tasks.reduce((sum, t) => sum + this.getScooperFee(t), 0n);
    const totalDeposit = BigInt(tasks.length) * ORDER_DEPOSIT_DEFAULT;

    return {
      scooperFee: new AssetAmount(totalScooperFee, ADA_METADATA),
      deposit: new AssetAmount(totalDeposit, ADA_METADATA),
    };
  }
}
```

---

#### 3.2 Example Usage: 4-Hop Order Route with Dynamic Chaining

```typescript
import { BuilderV1, BuilderV3, Composer } from "@sundaeswap/sdk";

// 1. Build V1 chain (ADA → INDY → BTC) with result-aware config
const builderV1 = new BuilderV1();
builderV1
  .swap({ pool: POOL_ADA_INDY, offered: ADA_100, slippage: 0.03 })
  .swap(({ prev }) => ({
    // Use estimated INDY output from previous swap
    pool: POOL_INDY_BTC,
    offered: prev.output,  // ← Dynamic!
    slippage: 0.03
  }));

// 2. Build V3 chain (BTC → USDM → Final destination)
const builderV3 = new BuilderV3();
builderV3
  .swap(({ prev }) => ({
    // Cross-builder: use V1's last output (BTC)
    pool: POOL_BTC_USDM,
    offered: prev.output,  // ← Crosses V1→V3 boundary
    slippage: 0.03
  }))
  .swap(({ prev }) => ({
    pool: POOL_USDM_ADA,
    offered: prev.output,  // ← Continue chain
    slippage: 0.03
  }));

// 3. Compose into single transaction
const composer = new Composer("addr_test1...", [builderV1, builderV3]);

const { build, fees } = await composer.build();

console.log("Total fees:", fees);
// {
//   scooperFee: { amount: 4_000_000n, metadata: ADA_METADATA },
//   deposit: { amount: 8_000_000n, metadata: ADA_METADATA }
// }

const { sign } = await build();
const { submit } = await sign();
const txHash = await submit();
```

**What happened:**
1. V1 swap (ADA → INDY) — estimated output used in next swap
2. V1 swap (INDY → BTC) — destinations to V3 order script (cross-version!)
3. V3 swap (BTC → USDM) — uses V1's BTC output
4. V3 swap (USDM → ADA) — destinations to `addr_test1...` (final)
5. Composer built datums in **reverse order** to establish chaining
6. Metadata attached with V3 deposit datum for V1 scooper lookup
7. Single Blaze transaction contains 4 order UTXOs

---

### Phase 4: Optional Extension Layer (Weeks 9-10)

**Goal:** Enable third-party integration via `IOperation` extraction interface.

**Note:** This phase is OPTIONAL. The core SDK (Serialization + Builder + Composer) is fully functional without it. Only implement if third-party integrators request cross-protocol chaining.

#### 4.1 IOperation Interface

**Location:** `packages/sdk/src/Interfaces/IOperation.ts`

```typescript
/**
 * Raw operation components for external protocol integration.
 * This is what third-party protocols need to merge SundaeSwap with their own transactions.
 */
export interface IOperation {
  inputs: Array<{ utxo: TUTXO; redeemer?: string }>;
  outputs: Array<{ address: string; value: AssetValue; datum?: string }>;
  referenceInputs: TUTXO[];
  requiredSigners: string[];
  metadata?: Map<bigint, unknown>;
}

/**
 * Extension to IComposedTx for advanced integration.
 */
export interface IComposedTx {
  // ... existing fields (tx, fees, build, sign, submit)

  /**
   * Extract raw operation components for external merging.
   * @advanced Only use if you're integrating SundaeSwap with other protocols.
   */
  extractOperation?(): IOperation;
}
```

---

#### 4.2 Composer with extractOperation()

**Location:** `packages/sdk/src/Composers/Composer.class.ts` (add method)

```typescript
export class Composer {
  // ... existing build() method

  /**
   * Extract raw operation components for external protocol merging.
   * @advanced Only use for third-party integration (Liqwid, Minswap, etc.)
   */
  extractOperation(): IOperation {
    const allTasks = this.builders.flatMap(b => b.getTasks());
    const resolvedDatums = this.buildDatumsReverse(allTasks);

    return {
      inputs: [],  // SundaeSwap orders don't consume specific UTXOs (wallet selection)
      outputs: allTasks.map((task, i) => ({
        address: this.getOrderScriptAddress(task.pool.version),
        value: this.assetsToValue(task.payment),
        datum: resolvedDatums[i].inline,
      })),
      referenceInputs: this.getReferenceInputs(),  // Protocol reference scripts
      requiredSigners: [this.ownerAddress],
      metadata: this.buildMetadata(resolvedDatums, allTasks),
    };
  }
}
```

---

#### 4.3 Third-Party Integration Example

```typescript
import { BuilderV3, Composer } from "@sundaeswap/sdk";

// 1. Build SundaeSwap swap using core API
const builder = new BuilderV3();
builder.swap({ pool: POOL_ADA_INDY, offered: ADA_100, slippage: 0.03 });

const composer = new Composer("addr1...", [builder]);
const sundaeSwapTx = await composer.build();

// 2. Extract operation components for external merging
const sundaeSwapOp = sundaeSwapTx.extractOperation();

// 3. Liqwid merges with their own protocol operations
const liqwidTx = liqwidSDK.newTransaction()
  .addSupply({ asset: ADA, amount: 100_000_000n })
  .addExternalOperation(sundaeSwapOp)  // ← Merge SundaeSwap
  .addBorrow({ asset: INDY, amount: 50_000_000n });

await liqwidTx.build().sign().submit();
```

**Key Point:** This is opt-in. Most SundaeSwap developers will never use `extractOperation()`.

---

### Phase 5: Backward Compatibility (Weeks 12-13)

**Goal:** Existing code continues working during migration period.

#### 5.1 Facade Methods

**Location:** `packages/sdk/src/TxBuilders/TxBuilderV3.class.ts` (legacy wrapper)

```typescript
import { BuilderLucidV3, ComposerLucid } from "../Builders";

/**
 * @deprecated Use BuilderLucidV3 + ComposerLucid instead.
 * This class is a backward compatibility wrapper.
 */
export class TxBuilderV3 {
  private builder = new BuilderLucidV3();
  private composer: ComposerLucid;

  constructor(
    private lucid: Lucid,
    private queryProvider: QueryProviderSundaeSwap,
  ) {
    this.composer = new ComposerLucid(
      "", // Will be set by method calls
      [this.builder],
      lucid
    );
  }

  /**
   * @deprecated Use builder.swap() + composer.build()
   */
  async swap(args: ISwapConfigArgs): Promise<IComposedTx> {
    this.builder.swap({
      pool: args.pool,
      offered: args.suppliedAsset,
      slippage: args.swapType.slippage ?? 0.03,
    });

    this.composer.finalDestination = args.orderAddresses.DestinationAddress.address;
    return await this.composer.build();
  }

  /**
   * @deprecated Use builder.deposit() + composer.build()
   */
  async deposit(args: IDepositConfigArgs): Promise<IComposedTx> {
    this.builder.deposit({
      pool: args.pool,
      assetA: args.depositPair.CoinAAmount,
      assetB: args.depositPair.CoinBAmount,
    });

    this.composer.finalDestination = args.orderAddresses.DestinationAddress.address;
    return await this.composer.build();
  }

  /**
   * @deprecated Use builder.swap().swap() + composer.build()
   */
  async orderRouteSwap(args: IOrderRouteSwapArgs): Promise<IComposedTx> {
    this.builder
      .swap({
        pool: args.swapA.pool,
        offered: args.swapA.suppliedAsset,
        slippage: 0.03,
      })
      .swap({
        pool: args.swapB.pool,
        offered: args.swapB.suppliedAsset,
        slippage: 0.03,
      });

    this.composer.finalDestination = args.ownerAddress;
    return await this.composer.build();
  }
}
```

**Migration Guide:**

Old code:
```typescript
const builder = sdk.builder(EContractVersion.V3);
const { build } = await builder.swap({
  pool: POOL_ADA_INDY,
  suppliedAsset: ADA_100,
  swapType: { type: ESwapType.MARKET, slippage: 0.03 },
  orderAddresses: { DestinationAddress: { address: "addr1..." } },
});
```

New code:
```typescript
const builder = new BuilderLucidV3();
builder.swap({ pool: POOL_ADA_INDY, offered: ADA_100, slippage: 0.03 });

const composer = new ComposerLucid("addr1...", [builder], lucid);
const { build } = await composer.build();
```

---

### Phase 6: Testing & Validation (Weeks 14-16)

#### 6.1 Unit Tests

**Serialization Layer:**
- Datum CBOR correctness (compare against current implementation)
- Datum hash correctness (V1 hashed datums)
- Staking credential inheritance (V3 inline datums)

**Builder Layer:**
- Task accumulation (swap → deposit → withdraw)
- Destination address resolution
- Payment calculation (supplied assets + fees)

**Composer Layer:**
- Datum chaining (each task points to next)
- Fee accumulation (total scooper fees + deposits)
- Metadata attachment (V1 compatibility)
- Cross-version transitions (V1 → V3, V3 → V1)

**Protocol Adapter:**
- Pool routing (best pool selection)
- Version abstraction (V1/V3/Stableswaps hidden)
- UTXO chaining (fromUtxo parameter)

---

#### 6.2 Integration Tests

**Test Scenarios:**

1. **Two-hop swap route (V1 → V1)**
   - Input: 100 ADA
   - Route: ADA → INDY (V1) → BTC (V1)
   - Verify: Single transaction with 2 order UTXOs

2. **Cross-version route (V1 → V3)**
   - Input: 100 ADA
   - Route: ADA → INDY (V1) → BTC (V3)
   - Verify: V1 datum references V3 order script address

3. **Zap (swap + deposit)**
   - Input: 100 ADA
   - Route: Swap 50 ADA → INDY, deposit 50 ADA + INDY to pool
   - Verify: Swap datum references deposit datum hash

4. **Liquidity migration (V1 → V3)**
   - Input: 100 LP tokens (V1 pool)
   - Route: Withdraw from V1 → Deposit to V3
   - Verify: Withdraw datum references V3 deposit script

5. **Four-hop route (V1 → V1 → V3 → V3)**
   - Input: 100 ADA
   - Route: ADA → INDY → BTC → USDM → ADA
   - Verify: 4 order UTXOs, datums chained correctly

---

#### 6.3 Performance Benchmarks

**Current SDK:**
- `orderRouteSwap()`: 127 lines of code, manual datum construction
- `migrateLiquidity()`: 385 lines of code, manual V1/V3 coordination

**Target SDK:**
- Two-hop swap: ~15 lines of code
- Liquidity migration: ~20 lines of code
- 4-hop route: ~25 lines of code

**Acceptance Criteria:**
- New API reduces code by >80% for complex patterns
- No performance regression (transaction build time)
- All existing tests pass with facade wrappers

---

## File Structure

```
packages/sdk/
├── src/
│   ├── Serialization/
│   │   ├── SerializationLucidV1.class.ts
│   │   ├── SerializationLucidV3.class.ts
│   │   └── index.ts
│   │
│   ├── Builders/
│   │   ├── BuilderLucidV1.class.ts
│   │   ├── BuilderLucidV3.class.ts
│   │   ├── ITask.interface.ts
│   │   └── index.ts
│   │
│   ├── Composers/
│   │   ├── ComposerLucid.class.ts
│   │   └── index.ts
│   │
│   ├── Adapters/
│   │   ├── SundaeSwapAdapter.class.ts
│   │   ├── IDEXProtocol.interface.ts
│   │   └── index.ts
│   │
│   ├── Legacy/  ← Backward compatibility
│   │   ├── TxBuilderV1.class.ts
│   │   ├── TxBuilderV3.class.ts
│   │   └── index.ts
│   │
│   └── exports/
│       ├── lucid.ts  → exports Builder/Composer
│       ├── adapters.ts  → exports SundaeSwapAdapter
│       └── legacy.ts  → exports TxBuilderV1/V3
│
├── tests/
│   ├── unit/
│   │   ├── Serialization/
│   │   ├── Builders/
│   │   ├── Composers/
│   │   └── Adapters/
│   │
│   └── integration/
│       ├── swap-routes.test.ts
│       ├── cross-version.test.ts
│       ├── zap.test.ts
│       └── migration.test.ts
│
└── package.json
```

---

## Migration Timeline

### Week 1-2: Serialization Layer
- [ ] Extract DatumBuilderV1 → SerializationV1
- [ ] Extract DatumBuilderV3 → SerializationV3
- [ ] Preserve TDatumResult return type (hash + inline + schema)
- [ ] Support TDestinationAddress with datum chaining
- [ ] Include ownerAddress, alternateAddress, extension fields
- [ ] Unit tests for datum construction and chaining

### Week 3-5: Builder Layer
- [ ] Define ITaskResult with outputs array
- [ ] Define ITaskContext for result-aware chaining
- [ ] Implement BuilderV1 with TaskConfig<T> support
- [ ] Implement BuilderV3 with TaskConfig<T> support
- [ ] Add estimateOutput() for all operation types
- [ ] Handle multi-asset outputs (withdraw returns [assetA, assetB])
- [ ] Unit tests for task accumulation and context-aware chaining

### Week 6-8: Composer Layer
- [ ] Implement Composer with reverse-order datum building
- [ ] Resolve output chaining (connect outputs to next inputs)
- [ ] Build datums in reverse (destination first, source last)
- [ ] Fee accumulation logic
- [ ] Metadata attachment for V1 (label 103251n)
- [ ] Handle V1↔V3 transitions (EDatumType.HASH vs INLINE)
- [ ] Unit tests for composition and cross-version chaining

### Week 9-10: Optional Extension Layer
- [ ] Add IOperation interface (optional export)
- [ ] Add extractOperation() to Composer
- [ ] Documentation for third-party integration
- [ ] Example: Liqwid + SundaeSwap chaining

### Week 11-12: Backward Compatibility
- [ ] Implement TxBuilderV3 facade
- [ ] Implement TxBuilderV1 facade
- [ ] Migration guide documentation
- [ ] Verify existing tests pass

### Week 13-15: Testing & Validation
- [ ] Integration tests (swap routes, zap, migration, multi-asset chaining)
- [ ] Performance benchmarks
- [ ] Documentation updates
- [ ] Beta release (@sundaeswap/sdk@0.1.0-beta.1)

### Week 16-17: Production Release
- [ ] Address beta feedback
- [ ] Final testing on testnet
- [ ] Mainnet deployment
- [ ] Release @sundaeswap/sdk@0.1.0
- [ ] Deprecation notice for @sundaeswap/core

---

## Risk Mitigation

### Risk: Breaking Changes for Existing Users

**Mitigation:**
- Maintain facade wrappers indefinitely
- Deprecation warnings but no removal for 6-12 months
- Clear migration guide with side-by-side examples

### Risk: Datum Construction Bugs

**Mitigation:**
- Property-based testing (generate random valid inputs)
- Compare CBOR output against current implementation (golden tests)
- Testnet deployment with real transactions before mainnet

### Risk: Performance Regression

**Mitigation:**
- Benchmark current SDK transaction build time
- Set acceptance criteria: <10% slowdown allowed
- Profile hot paths in datum construction and Lucid transaction building

### Risk: Cross-Version Datum Chaining Errors

**Mitigation:**
- Extensive integration tests for V1 → V3 and V3 → V1 transitions
- Verify datum hash correctness (V1 requires hashed datums in metadata)
- On-chain testing with scooper execution

---

## Success Metrics

1. **Code Reduction:** Complex patterns (zap, migration) reduced by >80%
2. **Test Coverage:** >95% for Serialization/Builder/Composer layers
3. **Backward Compatibility:** 100% of existing tests pass with facades
4. **Performance:** <10% regression in transaction build time
5. **Adoption:** >50% of new integrations use new API within 6 months

---

## Conclusion

This refactoring transforms the SundaeSwap SDK from a collection of hardcoded transaction methods into a composable, chainable architecture that:

1. **Eliminates combinatorial explosion** — No more hardcoded `orderRouteSwap()` or `migrateLiquidity()` methods
2. **Enables arbitrary composition** — Chain any number of swaps/deposits/withdrawals across V1/V3
3. **Supports third-party integration** — Protocol-agnostic interfaces for Liqwid, Minswap, etc.
4. **Preserves backward compatibility** — Existing code continues working via facade wrappers

The implementation follows a disciplined approach:
- **Phase 1-2:** Separate concerns (datum construction → transaction building)
- **Phase 3:** Enable chaining (ComposerLucid bundles builders)
- **Phase 4:** Enable cross-protocol (SundaeSwapAdapter implements IDEXProtocol)
- **Phase 5-6:** Ensure stability (backward compatibility + extensive testing)

**Next Steps:**
1. Review this plan with the team
2. Get architectural approval
3. Begin Phase 1 implementation
4. Iterate based on learnings

---

**Document Version:** 1.0
**Last Updated:** 2026-02-26
**Prepared By:** Multi-Agent Analysis Team
