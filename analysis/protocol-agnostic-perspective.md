# Protocol-Agnostic Analysis: SundaeSwap SDK

## Executive Summary

The @sundaeswap/core SDK is currently architected as a **SundaeSwap-first** library with deep protocol coupling throughout its stack. While abstract classes exist, they serve primarily as organizational tools rather than true abstraction boundaries. For a developer wanting to treat SundaeSwap as one of many interchangeable DEX protocols, significant refactoring would be required to achieve protocol-agnostic operations.

**Key Finding:** The SDK would need to separate three concerns that are currently intertwined:
1. **Generic DEX operations** (swap, deposit, withdraw)
2. **SundaeSwap protocol specifics** (datums, contract versions, scooper fees)
3. **Transaction builder tooling** (Blaze, Lucid, Mesh abstraction)

---

## 1. Protocol Coupling Assessment

### 1.1 SundaeSwap-Specific Concepts Embedded Throughout

The SDK exposes SundaeSwap implementation details at every layer:

#### **Contract Version Awareness in Public APIs**

**Location:** `/packages/core/src/@types/queryprovider.ts:100`

```typescript
export interface IPoolData {
  ident: string;
  assetA: IPoolDataAsset;
  assetB: IPoolDataAsset;
  liquidity: { aReserve: bigint; bReserve: bigint; lpTotal: bigint };
  version: EContractVersion;  // ← SundaeSwap V1/V3/NftCheck/Stableswaps
  // ...
}
```

**Impact:** Pool data carries SundaeSwap contract versioning throughout the application. A protocol-agnostic layer would need a `IPoolData` interface that doesn't expose `EContractVersion` directly—this is an implementation detail of how SundaeSwap manages multiple deployed contract versions.

**Alternative Design:**
```typescript
interface IGenericPoolData {
  protocol: string;           // "sundaeswap" | "minswap" | "wingriders"
  poolId: string;
  assetPair: [Asset, Asset];
  liquidity: { reserves: [bigint, bigint]; lpTotal: bigint };
  fee: number;
  // No version field—that's protocol-internal
}
```

---

#### **Scooper Fee Model Baked Into Transaction Construction**

**Location:** `/packages/core/src/TxBuilders/TxBuilder.V3.class.ts:615-623`

```typescript
let scooperFee = await this.getMaxScooperFeeAmount();

const { inline } = this.datumBuilder.buildSwapDatum({
  ident: pool.ident,
  destinationAddress: orderAddresses.DestinationAddress,
  ownerAddress: swapArgs.ownerAddress,
  order: { minReceived: minReceivable, offered: suppliedAsset },
  scooperFee,  // ← SundaeSwap-specific "batching fee"
});
```

**What it is:** SundaeSwap uses a "scooper" architecture where off-chain bots batch orders. Users pay a `scooperFee` (read from settings UTXO) to compensate the scooper.

**Why it's protocol-specific:** Minswap, WingRiders, and Spectrum don't use this model. They either:
- Execute swaps directly at the AMM contract (no batching)
- Use a batcher fee structure with different parameter naming
- Charge protocol fees differently (e.g., built into the swap calculation, not a separate UTXO deposit)

**Impact:** The swap datum construction assumes every protocol has a `scooperFee`/`maxProtocolFee` field. An agnostic layer would need:
- A `ProtocolFeeStrategy` abstraction
- Each protocol implementation decides how to encode fees in its datum

---

#### **Pool Ident Validation Tied to SundaeSwap Contract Versioning**

**Location:** `/packages/core/src/constants.ts:11-22`

```typescript
export const V3_POOL_IDENT_LENGTH = 56;  // V3 pools always 28 bytes (56 hex chars)
export const V1_MAX_POOL_IDENT_LENGTH = 10;  // V1 uses sequential integers
```

**Location:** `/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:590-596`

```typescript
public validatePoolIdent(ident: string): string {
  if (!SundaeUtils.isV3PoolIdent(ident)) {
    throw new Error(DatumBuilderV3.INVALID_POOL_IDENT);
  }
  return ident;
}
```

**Why it matters:** This validation logic is SundaeSwap-specific. Other protocols use entirely different pool identification schemes:
- **Minswap:** Uses NFT-based pool identification (policy ID + asset name)
- **WingRiders:** Uses script hash + token names
- **Spectrum:** Uses different ident derivation from UTXO seed

**Protocol-agnostic implication:** Pool identifiers should be opaque strings to the generic layer. Validation happens inside the protocol adapter, not at the core transaction building level.

---

#### **SundaeSwap GraphQL API Hardcoded**

**Location:** `/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts:25-28`

```typescript
const providerBaseUrls: Record<TSupportedNetworks, string> = {
  mainnet: "https://api.sundae.fi/graphql",
  preview: "https://api.preview.sundae.fi/graphql",
};
```

**The problem:** The `QueryProvider` abstract class defines a generic `findPoolData()` interface, but the only implementation queries SundaeSwap's GraphQL API with SundaeSwap-specific query shapes.

**What a protocol-agnostic version needs:**
```typescript
interface IProtocolAdapter {
  name: string;  // "sundaeswap" | "minswap"
  queryProvider: IGenericQueryProvider;
  txBuilder: IGenericTxBuilder;
}

// Each protocol implements this:
interface IGenericQueryProvider {
  findPools(query: IGenericPoolQuery): Promise<IGenericPoolData[]>;
  getProtocolParams(): Promise<IGenericProtocolParams>;
}
```

**Example:** Minswap would implement `MinswapQueryProvider` that queries their API/on-chain data, returning the same `IGenericPoolData` shape.

---

### 1.2 Datum Construction is Entirely SundaeSwap-Specific

**Location:** `/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:139-168`

The datum builder directly serializes SundaeSwap V3 contract types:

```typescript
public buildSwapDatum({ ... }: IDatumBuilderSwapV3Args): TDatumResult<V3Types.OrderDatum> {
  const datum: V3Types.OrderDatum = {  // ← This is the SundaeSwap V3 OrderDatum Plutus type
    poolIdent: this.validatePoolIdent(ident),
    destination: this.buildDestinationAddresses(destinationAddress).schema,
    owner: this.buildOwnerDatum(ownerAddress ?? destinationAddress.address).schema,
    maxProtocolFee: scooperFee,
    details: {
      Swap: {
        offer: this.buildAssetAmountDatum(order.offered).schema,
        minReceived: this.buildAssetAmountDatum(order.minReceived).schema,
      },
    },
    extension: VOID_BYTES,
  };

  const data = serialize(V3Types.OrderDatum, datum);
  return { hash: data.hash(), inline: data.toCbor(), schema: datum };
}
```

**Why this matters:**
- Every DEX has a different on-chain datum schema
- Minswap's swap datum includes different fields (e.g., `batcherFee`, `outputAddress`, no `extension` field)
- WingRiders uses an entirely different structure
- The generic layer can't know about `V3Types.OrderDatum`—that's an implementation detail

**Protocol-agnostic approach:**
```typescript
interface IProtocolDatumBuilder {
  buildSwapDatum(params: IGenericSwapParams): string;  // Returns CBOR
}

// SundaeSwap implementation
class SundaeSwapDatumBuilder implements IProtocolDatumBuilder {
  buildSwapDatum(params: IGenericSwapParams): string {
    // Translate generic params to SundaeSwap V3Types.OrderDatum
    // Return CBOR string
  }
}
```

---

### 1.3 Transaction Builder Tight Coupling to Blaze

**Location:** `/packages/core/src/TxBuilders/TxBuilder.V3.class.ts:82-86`

```typescript
export class TxBuilderV3 extends TxBuilderAbstractV3 {
  constructor(public blaze: Blaze<Provider, Wallet>, ...) {
    super();
    // ...
  }
}
```

**Location:** `/packages/core/package.json:82`

```json
"dependencies": {
  "@blaze-cardano/sdk": "^0.2.31",
  "@blaze-cardano/data": "^0.6.1",
  // ...
}
```

**The issue:** While the SDK historically supported Lucid (see archived docs referencing `TxBuilderLucidV1`), the current V3 implementation is Blaze-only. The transaction builder **is** the Blaze transaction builder.

**Why this blocks protocol abstraction:**
- If you want to support Minswap via Mesh.js, you'd need a `TxBuilderMesh` implementation
- But that implementation would also need Minswap-specific datum building, UTxO selection, etc.
- The current architecture conflates **protocol logic** (SundaeSwap) with **transaction library** (Blaze)

**What's needed:**
1. **Transaction library abstraction** (Blaze/Lucid/Mesh adapters)
2. **Protocol abstraction** (SundaeSwap/Minswap/WingRiders implementations)
3. **Composition layer** that combines them: `new Transaction(BlazeAdapter, SundaeSwapProtocol)`

---

### 1.4 Error Messages Assume SundaeSwap Context

**Location:** `/packages/core/src/Configs/SwapConfig.class.ts:124-127`

```typescript
if (!this.suppliedAsset) {
  throw new Error(
    "You haven't funded this swap on your SwapConfig! Fund the swap with .setSuppliedAsset()"
  );
}
```

**Location:** `/packages/core/src/TxBuilders/TxBuilder.V3.class.ts:94-95`

```typescript
static MIN_ADA_POOL_MINT_ERROR =
  "You tried to create a pool with less ADA than is required. Try again with more than 2 ADA.";
```

**Impact:** Error messages reference SDK-specific class names (`SwapConfig`) and SundaeSwap protocol rules (2 ADA minimum for pool creation). A protocol-agnostic SDK would need:
- Generic error types that don't reference implementation classes
- Protocol-specific error messages returned from adapters

---

## 2. Abstraction Gaps and Opportunities

### 2.1 Existing Abstractions Are Organizational, Not Functional

**Location:** `/packages/core/src/Abstracts/TxBuilderAbstract.V3.class.ts:11-33`

```typescript
export abstract class TxBuilderAbstractV3 {
  abstract queryProvider: QueryProvider;
  abstract datumBuilder: DatumBuilderAbstract;
  abstract network: TSupportedNetworks;
  abstract contractVersion: EContractVersion;  // ← Still SundaeSwap-specific!

  abstract newTxInstance(): unknown;
  abstract swap(args: unknown): Promise<IComposedTx>;
  abstract deposit(args: unknown): Promise<IComposedTx>;
  abstract withdraw(args: unknown): Promise<IComposedTx>;
  // ...
}
```

**What's missing:** While the methods are abstract, their implementations across `TxBuilderV1`, `TxBuilderV3`, `TxBuilderNftCheck`, and `TxBuilderStableswaps` all assume:
- Pool data structure is identical
- Datum construction uses SundaeSwap contract types
- Fee calculation uses scooper fee model

**The problem:** This is **vertical abstraction** (supporting multiple SundaeSwap contract versions) not **horizontal abstraction** (supporting multiple DEX protocols).

**What horizontal abstraction looks like:**
```typescript
interface IProtocolTxBuilder {
  protocol: string;
  swap(params: IGenericSwapParams): Promise<IComposedTx>;
  deposit(params: IGenericDepositParams): Promise<IComposedTx>;
  withdraw(params: IGenericWithdrawParams): Promise<IComposedTx>;
}

class SundaeSwapTxBuilder implements IProtocolTxBuilder {
  protocol = "sundaeswap";
  // Uses internal logic to handle V1/V3/NftCheck/Stableswaps
  // Datum building, scooper fees, etc. are internal concerns
}

class MinswapTxBuilder implements IProtocolTxBuilder {
  protocol = "minswap";
  // Completely different implementation
}
```

---

### 2.2 Pool Data Structure Leaks SundaeSwap Concepts

**Location:** `/packages/core/src/@types/queryprovider.ts:87-104`

```typescript
export interface IPoolData {
  currentFee: number;
  ident: string;
  assetA: IPoolDataAsset;
  assetB: IPoolDataAsset;
  assetLP: Omit<IPoolDataAsset, "decimals"> & { decimals?: number };
  liquidity: {
    aReserve: bigint;
    bReserve: bigint;
    lpTotal: bigint;
  };
  version: EContractVersion;  // ← Protocol-specific
  conditionDatum?: string;  // ← SundaeSwap V3 "conditional pools" feature
  protocolFee?: number;  // ← OK, but naming might differ per protocol
  linearAmplificationFactor?: bigint;  // ← SundaeSwap Stableswaps feature
}
```

**The good news:** Most fields are generic enough (reserves, assets, fee)

**The bad news:**
- `version: EContractVersion` exposes SundaeSwap internal versioning
- `conditionDatum` is a SundaeSwap V3 feature (pools with conditions like NFT checks)
- `linearAmplificationFactor` is Stableswaps-specific

**Protocol-agnostic design:**
```typescript
interface IGenericPoolData {
  protocol: string;
  poolId: string;
  assetPair: [Asset, Asset];
  liquidity: { reserves: [bigint, bigint]; lpTotal: bigint };
  fee: number;
  protocolMetadata?: Record<string, unknown>;  // Protocol-specific extras
}

// SundaeSwap would populate:
// protocolMetadata: {
//   version: "V3",
//   conditionDatum: "...",
//   linearAmplificationFactor: 1000n
// }
```

---

### 2.3 No Transaction Library Abstraction

**Current state:** The SDK requires Blaze. The `TxBuilderV3` constructor takes `blaze: Blaze<Provider, Wallet>` directly.

**Location:** `/packages/core/src/TxBuilders/TxBuilder.V3.class.ts:102-114`

```typescript
constructor(
  public blaze: Blaze<Provider, Wallet>,
  queryProvider?: QueryProviderSundaeSwap,
) {
  super();
  const network: TSupportedNetworks = blaze.provider.network ? "mainnet" : "preview";
  this.network = network;
  this.queryProvider = queryProvider ?? new QueryProviderSundaeSwap(network);
  this.datumBuilder = new DatumBuilderV3(network);
}
```

**Why this matters for protocol abstraction:** If you want to use the SDK with Lucid or Mesh, you'd need:
1. A Lucid transaction adapter
2. But you'd still be building SundaeSwap-specific transactions

**Separation needed:**
- **Transaction library layer:** Adapter pattern for Blaze/Lucid/Mesh
- **Protocol layer:** SundaeSwap/Minswap/WingRiders logic
- **Composition:** Pick any transaction library + any protocol

**Example:**
```typescript
const txLibrary = new BlazeAdapter(blazeInstance);
const protocol = new SundaeSwapProtocol({ network: "mainnet" });
const sdk = new UnifiedDEXSDK(txLibrary, protocol);

// Or:
const txLibrary = new LucidAdapter(lucidInstance);
const protocol = new MinswapProtocol();
const sdk = new UnifiedDEXSDK(txLibrary, protocol);
```

---

## 3. Portability Requirements for Multi-Protocol Support

### 3.1 What Needs to Be Abstracted

To support `userTransaction.swap(assetA, assetB).using(SundaeSwapProtocol).or(MinswapProtocol)`, you need:

#### **Generic Operation Interface**
```typescript
interface ISwapOperation {
  from: Asset;
  to: Asset;
  amount: bigint;
  slippage: number;
  recipient: string;
}

interface IDEXProtocol {
  name: string;
  canExecute(op: ISwapOperation): Promise<boolean>;  // Check liquidity, fees, etc.
  buildSwapTx(op: ISwapOperation): Promise<IComposedTx>;
}
```

#### **Protocol Adapter Pattern**
```typescript
class SundaeSwapAdapter implements IDEXProtocol {
  name = "sundaeswap";

  async canExecute(op: ISwapOperation): Promise<boolean> {
    // Query SundaeSwap API for pools with this pair
    const pools = await this.queryProvider.findPoolData({ pair: [op.from.assetId, op.to.assetId] });
    return pools.length > 0;
  }

  async buildSwapTx(op: ISwapOperation): Promise<IComposedTx> {
    // Find best pool, build SundaeSwap-specific datum, construct tx
  }
}

class MinswapAdapter implements IDEXProtocol {
  name = "minswap";
  // Entirely different implementation
}
```

#### **Routing Layer**
```typescript
class DEXAggregator {
  constructor(private protocols: IDEXProtocol[]) {}

  async swap(op: ISwapOperation): Promise<IComposedTx> {
    // Try protocols in order, return first that can execute
    for (const protocol of this.protocols) {
      if (await protocol.canExecute(op)) {
        return await protocol.buildSwapTx(op);
      }
    }
    throw new Error("No protocol available for this swap");
  }
}
```

---

### 3.2 Transaction Builder vs. Protocol Logic Separation

**Current conflation:**
```
TxBuilderV3 = Blaze transaction library + SundaeSwap V3 protocol logic
```

**Needed separation:**
```
TransactionBuilder (Blaze/Lucid/Mesh)
       +
ProtocolAdapter (SundaeSwap/Minswap/WingRiders)
       =
Complete DEX transaction
```

**Why this matters:** You want to support:
- `BlazeAdapter + SundaeSwapProtocol`
- `BlazeAdapter + MinswapProtocol`
- `LucidAdapter + SundaeSwapProtocol`
- `LucidAdapter + MinswapProtocol`

**Current SDK only supports:** `Blaze + SundaeSwap`

---

### 3.3 Datum Construction Must Be Protocol-Internal

**Current state:** `DatumBuilderV3.buildSwapDatum()` returns `TDatumResult<V3Types.OrderDatum>`, exposing the SundaeSwap contract type schema.

**Protocol-agnostic approach:**
```typescript
interface IProtocolDatumBuilder {
  buildSwapDatum(params: IGenericSwapParams): string;  // Returns opaque CBOR
}
```

**Why:** The generic layer shouldn't care about the internal structure of datums. It just needs:
1. The CBOR string to attach to the UTxO
2. Optionally, the datum hash (for protocols that use datum hashing)

**Inside the protocol adapter:**
```typescript
class SundaeSwapV3DatumBuilder implements IProtocolDatumBuilder {
  buildSwapDatum(params: IGenericSwapParams): string {
    const datum: V3Types.OrderDatum = {
      poolIdent: this.computeIdent(params.poolId),
      // ...SundaeSwap-specific fields
    };
    return serialize(V3Types.OrderDatum, datum).toCbor();
  }
}
```

---

## 4. Developer Experience from Agnostic Perspective

### 4.1 Current Developer Journey (SundaeSwap-First)

**Step 1: Install SDK**
```bash
bun add @sundaeswap/core @blaze-cardano/sdk
```
- Developer is already locked into SundaeSwap + Blaze

**Step 2: Initialize SDK**
```typescript
const SDK = await new SundaeSDK({ blazeInstance });
```
- Class name explicitly references SundaeSwap
- Constructor requires Blaze instance

**Step 3: Query Pool Data**
```typescript
const poolData = await SDK.query().findPoolData({ ident: "34c2b9..." });
```
- Pool ident format is SundaeSwap-specific (28-byte hash for V3)
- Developer must understand SundaeSwap's pool identification system

**Step 4: Build Swap Config**
```typescript
const args: ISwapConfigArgs = {
  pool: poolData,  // Contains SundaeSwap version, conditionDatum, etc.
  swapType: { type: ESwapType.MARKET, slippage: 0.03 },
  // ...
};
```
- `ISwapConfigArgs` includes SundaeSwap-specific fields

**Step 5: Select Contract Version and Build Transaction**
```typescript
const { build } = await SDK.builder(EContractVersion.V3).swap(args);
```
- Developer must know about SundaeSwap contract versions (V1, V3, NftCheck, Stableswaps)
- No other protocol is an option

---

### 4.2 Ideal Developer Journey (Protocol-Agnostic)

**Step 1: Install Generic DEX SDK**
```bash
bun add @dex-sdk/core @dex-sdk/sundaeswap @dex-sdk/minswap @blaze-cardano/sdk
```
- Core SDK is protocol-agnostic
- Protocol implementations are separate packages

**Step 2: Initialize with Protocols**
```typescript
const dex = new UnifiedDEXSDK({
  txLibrary: new BlazeAdapter(blazeInstance),
  protocols: [
    new SundaeSwapProtocol({ network: "mainnet" }),
    new MinswapProtocol({ network: "mainnet" }),
  ],
});
```
- Transaction library is pluggable
- Multiple protocols registered upfront

**Step 3: Protocol-Agnostic Swap**
```typescript
const tx = await dex.swap({
  from: { assetId: "ada.lovelace", amount: 25_000_000n },
  to: { assetId: "fa3eff...74494e4459" },
  slippage: 0.03,
  recipient: "addr1...",
});
```
- No pool ident lookup required (SDK finds best pool internally)
- No contract version selection (handled per-protocol)
- Developer doesn't need to know which protocol executed the swap

**Step 4: Explicit Protocol Selection (Optional)**
```typescript
const tx = await dex.swap({
  // ...same params
  preferredProtocol: "sundaeswap",  // Or omit for automatic selection
});
```

**Step 5: Protocol Fallback**
```typescript
const tx = await dex.swap({
  // ...same params
}).using(SundaeSwapProtocol).or(MinswapProtocol);
```
- Tries SundaeSwap first
- Falls back to Minswap if SundaeSwap can't execute (no pool, insufficient liquidity, etc.)

---

### 4.3 Learning Curve Analysis

**Current SDK:**
- **Low barrier if you only care about SundaeSwap:** Documentation is clear for this use case
- **High barrier for protocol abstraction:** No path to use other DEXs without writing your own integration

**Concepts developer must learn:**
1. SundaeSwap contract versions (V1, V3, NftCheck, Stableswaps)
2. Scooper fee model and settings UTXO
3. Pool ident format and validation rules
4. Datum structure (if debugging transactions)
5. Blaze transaction library specifics

**Ideal SDK:**
- **Low barrier for any DEX:** Same API regardless of protocol
- **No protocol-specific knowledge required** unless debugging

**Concepts developer must learn:**
1. Generic swap/deposit/withdraw operations
2. Transaction library choice (Blaze/Lucid/Mesh)
3. Optional: Protocol-specific features (if intentionally targeting one DEX)

---

### 4.4 Error Handling and Debugging

**Current SDK:**
- Errors reference SundaeSwap implementation details
- Example: `"INVALID_POOL_IDENT"` — developer must understand pool ident rules

**Location:** `/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:120-121`
```typescript
static INVALID_POOL_IDENT =
  "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";
```

**Problem:** References "scooper" (SundaeSwap-specific batching model) and pool ident length (V3 = 56 chars, V1 ≤ 10 chars)

**Protocol-agnostic error handling:**
```typescript
class ProtocolError extends Error {
  constructor(
    public protocol: string,
    public operation: string,
    message: string,
    public details?: unknown
  ) {
    super(`[${protocol}] ${operation}: ${message}`);
  }
}

// Usage:
throw new ProtocolError(
  "sundaeswap",
  "swap",
  "Pool not found for asset pair",
  { assetA: "ada.lovelace", assetB: "fa3eff..." }
);
```

---

## 5. Recommendations for Protocol-Agnostic Interfaces

### 5.1 Three-Layer Architecture

```
┌─────────────────────────────────────────────┐
│   Application Layer (User Code)            │
│   - Calls dex.swap(), dex.deposit(), etc.  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Generic DEX Interface                     │
│   - ISwapOperation, IDepositOperation       │
│   - IDEXProtocol, IProtocolAdapter          │
│   - Routing logic, protocol selection       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Protocol Adapters (Plugin Architecture)  │
│   - SundaeSwapAdapter                       │
│   - MinswapAdapter                          │
│   - WingRidersAdapter                       │
│   Each handles protocol-specific logic:     │
│   - Datum construction                      │
│   - Fee calculation                         │
│   - Pool querying                           │
│   - UTxO selection                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Transaction Library Adapters              │
│   - BlazeAdapter                            │
│   - LucidAdapter                            │
│   - MeshAdapter                             │
│   Provides low-level tx construction        │
└─────────────────────────────────────────────┘
```

---

### 5.2 Core Interfaces

#### **5.2.1 Generic Swap Operation**
```typescript
interface ISwapOperation {
  from: { assetId: string; amount: bigint };
  to: { assetId: string };
  slippage: number;
  recipient: string;
  metadata?: {
    deadline?: number;  // Unix timestamp
    referral?: string;  // Referral address
  };
}
```

#### **5.2.2 Protocol Adapter Interface**
```typescript
interface IDEXProtocol {
  readonly name: string;
  readonly network: "mainnet" | "preview";

  // Query capabilities
  findPools(query: IPoolQuery): Promise<IGenericPoolData[]>;

  // Transaction building
  buildSwapTx(op: ISwapOperation): Promise<IComposedTx>;
  buildDepositTx(op: IDepositOperation): Promise<IComposedTx>;
  buildWithdrawTx(op: IWithdrawOperation): Promise<IComposedTx>;

  // Validation
  canExecuteSwap(op: ISwapOperation): Promise<boolean>;
  estimateSwapOutput(op: ISwapOperation): Promise<bigint>;
}
```

#### **5.2.3 Generic Pool Data**
```typescript
interface IGenericPoolData {
  protocol: string;  // "sundaeswap" | "minswap"
  poolId: string;    // Opaque identifier
  assetPair: [Asset, Asset];
  liquidity: {
    reserves: [bigint, bigint];
    lpTotal: bigint;
  };
  fee: number;  // As decimal (0.03 = 3%)

  // Protocol-specific data (optional)
  protocolMetadata?: Record<string, unknown>;
}
```

#### **5.2.4 Transaction Library Adapter**
```typescript
interface ITxLibraryAdapter {
  readonly name: string;  // "blaze" | "lucid" | "mesh"

  // Core transaction construction
  newTx(): ITxBuilder;
  signTx(tx: ITxBuilder): Promise<string>;  // Returns CBOR
  submitTx(signedTxCbor: string): Promise<string>;  // Returns tx hash
}

interface ITxBuilder {
  addInput(utxo: IUTxO): ITxBuilder;
  addOutput(address: string, assets: IAssets, datum?: string): ITxBuilder;
  setCollateral(utxos: IUTxO[]): ITxBuilder;
  complete(): Promise<ITxBuilder>;  // Finalize with coin selection, fee calc
}
```

---

### 5.3 Protocol Adapter Example: SundaeSwap

```typescript
export class SundaeSwapAdapter implements IDEXProtocol {
  readonly name = "sundaeswap";

  constructor(
    private network: "mainnet" | "preview",
    private txLibrary: ITxLibraryAdapter,
  ) {
    this.queryProvider = new QueryProviderSundaeSwap(network);
    this.datumBuilder = new SundaeSwapDatumBuilder(network);
  }

  async findPools(query: IPoolQuery): Promise<IGenericPoolData[]> {
    // Query SundaeSwap API
    const pools = await this.queryProvider.findPoolData({
      pair: query.assetPair,
    });

    // Transform to generic format
    return pools.map(pool => ({
      protocol: "sundaeswap",
      poolId: pool.ident,
      assetPair: [pool.assetA, pool.assetB],
      liquidity: {
        reserves: [pool.liquidity.aReserve, pool.liquidity.bReserve],
        lpTotal: pool.liquidity.lpTotal,
      },
      fee: pool.currentFee,
      protocolMetadata: {
        version: pool.version,
        conditionDatum: pool.conditionDatum,
      },
    }));
  }

  async buildSwapTx(op: ISwapOperation): Promise<IComposedTx> {
    // Find best pool
    const pools = await this.findPools({
      assetPair: [op.from.assetId, op.to.assetId],
    });
    const pool = this.selectBestPool(pools, op);

    // Build SundaeSwap-specific datum
    const scooperFee = await this.getMaxScooperFee();
    const datumCbor = this.datumBuilder.buildSwapDatum({
      poolIdent: pool.poolId,
      offered: op.from,
      minReceived: this.calculateMinOutput(pool, op),
      scooperFee,
    });

    // Use generic transaction builder
    const tx = this.txLibrary.newTx()
      .addInput(/* user UTxO with funds */)
      .addOutput(
        await this.getOrderScriptAddress(),
        { lovelace: op.from.amount + scooperFee },
        datumCbor
      );

    return tx.complete();
  }

  // SundaeSwap-specific internal methods
  private async getMaxScooperFee(): Promise<bigint> {
    // Query settings UTXO
  }

  private async getOrderScriptAddress(): Promise<string> {
    // Get validator script address for current version
  }
}
```

---

### 5.4 User-Facing API

```typescript
import { UnifiedDEXSDK } from "@dex-sdk/core";
import { SundaeSwapAdapter } from "@dex-sdk/sundaeswap";
import { MinswapAdapter } from "@dex-sdk/minswap";
import { BlazeAdapter } from "@dex-sdk/blaze";

// Initialize
const dex = new UnifiedDEXSDK({
  txLibrary: new BlazeAdapter(blazeInstance),
  protocols: [
    new SundaeSwapAdapter({ network: "mainnet" }),
    new MinswapAdapter({ network: "mainnet" }),
  ],
});

// Simple swap (automatic protocol selection)
const tx = await dex.swap({
  from: { assetId: "ada.lovelace", amount: 25_000_000n },
  to: { assetId: "fa3eff...74494e4459" },
  slippage: 0.03,
  recipient: "addr1...",
});

const { builtTx } = await tx.build();
const { submit } = await builtTx.sign();
const txHash = await submit();

// Explicit protocol selection
const tx = await dex.swap({
  // ...same params
  preferredProtocol: "sundaeswap",
});

// Protocol fallback
const tx = await dex.swap({
  // ...same params
  protocols: ["sundaeswap", "minswap"],  // Try in order
});

// Query pools across protocols
const pools = await dex.findPools({
  assetPair: ["ada.lovelace", "fa3eff..."],
});
// Returns: [
//   { protocol: "sundaeswap", poolId: "...", liquidity: {...}, fee: 0.03 },
//   { protocol: "minswap", poolId: "...", liquidity: {...}, fee: 0.025 },
// ]
```

---

## 6. Design Patterns for Interchangeable Providers

### 6.1 Adapter Pattern for Protocols

Each protocol implements the same interface but handles internal logic differently:

```typescript
// Generic interface
interface IDEXProtocol {
  name: string;
  buildSwapTx(op: ISwapOperation): Promise<IComposedTx>;
}

// SundaeSwap implementation
class SundaeSwapAdapter implements IDEXProtocol {
  name = "sundaeswap";

  async buildSwapTx(op: ISwapOperation): Promise<IComposedTx> {
    // 1. Query pool from SundaeSwap API
    // 2. Build V3Types.OrderDatum with scooper fee
    // 3. Construct transaction with datum at order script address
    // 4. Return IComposedTx
  }
}

// Minswap implementation
class MinswapAdapter implements IDEXProtocol {
  name = "minswap";

  async buildSwapTx(op: ISwapOperation): Promise<IComposedTx> {
    // 1. Query pool from Minswap API
    // 2. Build Minswap-specific datum (different structure)
    // 3. Construct transaction (no scooper fee, different script address)
    // 4. Return IComposedTx
  }
}
```

**Key principle:** The adapter translates generic operations into protocol-specific implementation details.

---

### 6.2 Strategy Pattern for Transaction Library

The transaction library (Blaze/Lucid/Mesh) is selected as a strategy:

```typescript
interface ITxLibraryStrategy {
  newTx(): ITxBuilder;
  signTx(tx: ITxBuilder): Promise<string>;
  submitTx(cbor: string): Promise<string>;
}

class BlazeStrategy implements ITxLibraryStrategy {
  constructor(private blaze: Blaze<Provider, Wallet>) {}

  newTx(): ITxBuilder {
    return new BlazeTxBuilder(this.blaze.newTransaction());
  }

  async signTx(tx: ITxBuilder): Promise<string> {
    const blazeTx = (tx as BlazeTxBuilder).inner;
    const signed = await this.blaze.signTransaction(blazeTx);
    return signed.toCbor();
  }

  async submitTx(cbor: string): Promise<string> {
    const tx = Core.Transaction.fromCbor(cbor);
    return await this.blaze.submitTransaction(tx);
  }
}

class LucidStrategy implements ITxLibraryStrategy {
  constructor(private lucid: Lucid) {}
  // Similar implementation using Lucid APIs
}
```

**Key principle:** The transaction library is swappable without affecting protocol logic.

---

### 6.3 Registry Pattern for Protocol Discovery

```typescript
class ProtocolRegistry {
  private protocols = new Map<string, IDEXProtocol>();

  register(protocol: IDEXProtocol): void {
    this.protocols.set(protocol.name, protocol);
  }

  get(name: string): IDEXProtocol | undefined {
    return this.protocols.get(name);
  }

  getAll(): IDEXProtocol[] {
    return Array.from(this.protocols.values());
  }

  async findBestFor(op: ISwapOperation): Promise<IDEXProtocol> {
    // Evaluate each protocol:
    // - Can it execute the swap?
    // - What's the estimated output?
    // - What's the total fee?
    // Return the best option
  }
}

// Usage:
const registry = new ProtocolRegistry();
registry.register(new SundaeSwapAdapter({ network: "mainnet" }));
registry.register(new MinswapAdapter({ network: "mainnet" }));

const best = await registry.findBestFor({
  from: { assetId: "ada.lovelace", amount: 25_000_000n },
  to: { assetId: "fa3eff..." },
  slippage: 0.03,
  recipient: "addr1...",
});

console.log(best.name);  // "minswap" (if it offers better rates)
```

---

### 6.4 Builder Pattern for Transaction Composition

```typescript
class SwapTransactionBuilder {
  private operation: Partial<ISwapOperation> = {};
  private protocols: IDEXProtocol[] = [];

  from(assetId: string, amount: bigint): this {
    this.operation.from = { assetId, amount };
    return this;
  }

  to(assetId: string): this {
    this.operation.to = { assetId };
    return this;
  }

  withSlippage(slippage: number): this {
    this.operation.slippage = slippage;
    return this;
  }

  sendTo(recipient: string): this {
    this.operation.recipient = recipient;
    return this;
  }

  using(...protocols: IDEXProtocol[]): this {
    this.protocols.push(...protocols);
    return this;
  }

  async build(): Promise<IComposedTx> {
    // Validate operation is complete
    if (!this.isValid()) {
      throw new Error("Incomplete swap operation");
    }

    // Try protocols in order
    for (const protocol of this.protocols) {
      if (await protocol.canExecuteSwap(this.operation as ISwapOperation)) {
        return await protocol.buildSwapTx(this.operation as ISwapOperation);
      }
    }

    throw new Error("No protocol can execute this swap");
  }

  private isValid(): boolean {
    return !!(this.operation.from && this.operation.to && this.operation.recipient);
  }
}

// Usage:
const tx = await new SwapTransactionBuilder()
  .from("ada.lovelace", 25_000_000n)
  .to("fa3eff...74494e4459")
  .withSlippage(0.03)
  .sendTo("addr1...")
  .using(sundaeswap, minswap)
  .build();
```

---

## 7. Migration Path from Current SDK

### 7.1 Backwards Compatibility Approach

**Option 1: Wrapper Layer**
- Keep existing `@sundaeswap/core` API unchanged
- Create new `@sundaeswap/unified-dex` package
- Implement adapters that wrap existing SDK

```typescript
// Existing code still works
import { SundaeSDK } from "@sundaeswap/core";
const sdk = new SundaeSDK({ blazeInstance });

// New protocol-agnostic code
import { UnifiedDEXSDK } from "@sundaeswap/unified-dex";
const dex = new UnifiedDEXSDK({
  txLibrary: new BlazeAdapter(blazeInstance),
  protocols: [new SundaeSwapAdapter()],
});
```

**Option 2: Gradual Refactor**
1. Phase 1: Extract SundaeSwap-specific logic into internal adapters
2. Phase 2: Create generic interfaces alongside existing APIs
3. Phase 3: Mark old APIs as deprecated
4. Phase 4: Remove deprecated APIs in next major version

---

### 7.2 Refactoring Steps

**Step 1: Separate Transaction Library from Protocol Logic**

Current:
```typescript
// TxBuilderV3 mixes Blaze and SundaeSwap logic
class TxBuilderV3 {
  constructor(public blaze: Blaze<Provider, Wallet>) {
    this.datumBuilder = new DatumBuilderV3(...);
  }

  async swap(args: ISwapConfigArgs): Promise<IComposedTx> {
    // Blaze transaction construction + SundaeSwap datum building
  }
}
```

Refactored:
```typescript
// Protocol logic (SundaeSwap-specific)
class SundaeSwapProtocol {
  async buildSwapDatum(op: ISwapOperation): Promise<string> {
    // Build V3Types.OrderDatum
  }

  async getOrderScriptAddress(): Promise<string> {
    // Get validator address
  }
}

// Transaction library adapter (Blaze-specific)
class BlazeAdapter implements ITxLibraryAdapter {
  constructor(private blaze: Blaze<Provider, Wallet>) {}

  newTx(): ITxBuilder {
    return new BlazeTxBuilder(this.blaze.newTransaction());
  }
}

// Composition
class SwapTxComposer {
  constructor(
    private protocol: SundaeSwapProtocol,
    private txLibrary: BlazeAdapter,
  ) {}

  async buildSwap(op: ISwapOperation): Promise<IComposedTx> {
    const datum = await this.protocol.buildSwapDatum(op);
    const scriptAddress = await this.protocol.getOrderScriptAddress();

    return this.txLibrary.newTx()
      .addOutput(scriptAddress, {...}, datum)
      .complete();
  }
}
```

**Step 2: Create Generic Pool Data Interface**

Current:
```typescript
export interface IPoolData {
  version: EContractVersion;  // SundaeSwap-specific
  conditionDatum?: string;  // SundaeSwap-specific
  // ...
}
```

Refactored:
```typescript
export interface IGenericPoolData {
  protocol: string;
  poolId: string;
  assetPair: [Asset, Asset];
  liquidity: { reserves: [bigint, bigint]; lpTotal: bigint };
  fee: number;
  protocolMetadata?: unknown;
}

// SundaeSwap adapter provides protocol-specific metadata
interface ISundaeSwapPoolMetadata {
  version: EContractVersion;
  conditionDatum?: string;
  linearAmplificationFactor?: bigint;
}
```

**Step 3: Abstract Query Provider**

Current:
```typescript
class QueryProviderSundaeSwap {
  async findPoolData(query: IPoolByIdentQuery): Promise<IPoolData> {
    // Query SundaeSwap GraphQL API
  }
}
```

Refactored:
```typescript
interface IGenericQueryProvider {
  findPools(query: IPoolQuery): Promise<IGenericPoolData[]>;
}

class SundaeSwapQueryAdapter implements IGenericQueryProvider {
  private provider = new QueryProviderSundaeSwap(this.network);

  async findPools(query: IPoolQuery): Promise<IGenericPoolData[]> {
    const pools = await this.provider.findPoolData(query);
    return pools.map(this.transformToGeneric);
  }

  private transformToGeneric(pool: IPoolData): IGenericPoolData {
    return {
      protocol: "sundaeswap",
      poolId: pool.ident,
      assetPair: [pool.assetA, pool.assetB],
      liquidity: {
        reserves: [pool.liquidity.aReserve, pool.liquidity.bReserve],
        lpTotal: pool.liquidity.lpTotal,
      },
      fee: pool.currentFee,
      protocolMetadata: {
        version: pool.version,
        conditionDatum: pool.conditionDatum,
      } as ISundaeSwapPoolMetadata,
    };
  }
}
```

---

## 8. Conclusion

### 8.1 Summary of Findings

The @sundaeswap/core SDK is **tightly coupled to SundaeSwap protocol specifics** at all layers:
1. Pool data structures expose contract versioning (`EContractVersion`)
2. Datum construction is SundaeSwap V3Types-specific
3. Transaction building assumes Blaze library
4. Fee calculation uses scooper fee model
5. Query providers target SundaeSwap GraphQL API

**To treat SundaeSwap as a commodity protocol among many**, you would need to:
- Extract protocol-specific logic into adapters
- Create generic interfaces for swap/deposit/withdraw operations
- Separate transaction library (Blaze) from protocol logic (SundaeSwap)
- Implement a registry/routing layer for multi-protocol support

---

### 8.2 Recommended Architecture

```
┌──────────────────────────────────────────────────────┐
│  Generic DEX SDK (@dex-sdk/core)                     │
│  - ISwapOperation, IDepositOperation interfaces      │
│  - IDEXProtocol adapter interface                    │
│  - ProtocolRegistry for discovery and routing        │
│  - SwapTransactionBuilder for fluent API             │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Protocol Adapters (separate packages)               │
│  - @dex-sdk/sundaeswap                               │
│  - @dex-sdk/minswap                                  │
│  - @dex-sdk/wingriders                               │
│  Each implements IDEXProtocol interface              │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Transaction Library Adapters                        │
│  - @dex-sdk/blaze                                    │
│  - @dex-sdk/lucid                                    │
│  - @dex-sdk/mesh                                     │
│  Implements ITxLibraryAdapter interface              │
└──────────────────────────────────────────────────────┘
```

---

### 8.3 Developer Experience Goals

**Current state:** Developer must learn SundaeSwap specifics to use SDK

**Desired state:** Developer writes protocol-agnostic code:
```typescript
// No SundaeSwap knowledge required
const tx = await dex.swap({
  from: { assetId: "ada.lovelace", amount: 25_000_000n },
  to: { assetId: "fa3eff...74494e4459" },
  slippage: 0.03,
  recipient: "addr1...",
});

// SDK automatically:
// 1. Finds best protocol with liquidity for this pair
// 2. Queries the appropriate API
// 3. Builds protocol-specific datum
// 4. Constructs transaction with correct script addresses
// 5. Returns IComposedTx ready to sign and submit
```

**Protocol selection becomes an implementation detail, not a developer concern.**

---

### 8.4 Next Steps for Refactoring

1. **Define generic interfaces** (`ISwapOperation`, `IDEXProtocol`, `ITxLibraryAdapter`)
2. **Extract SundaeSwap logic** into `SundaeSwapAdapter` that implements `IDEXProtocol`
3. **Create Blaze adapter** that implements `ITxLibraryAdapter`
4. **Build composition layer** that combines protocol + tx library
5. **Implement routing logic** for automatic protocol selection
6. **Add Minswap/WingRiders adapters** to prove portability
7. **Create developer docs** showing protocol-agnostic usage patterns

---

### 8.5 Key Takeaways

1. **The SDK is SundaeSwap-first by design.** This is not a flaw—it serves its purpose well for SundaeSwap-focused developers.

2. **Protocol abstraction requires architectural changes.** You can't just wrap the existing SDK—the coupling runs too deep.

3. **Transaction library separation is critical.** Protocol logic (SundaeSwap) and transaction construction (Blaze) must be decoupled.

4. **Datum construction is the biggest portability challenge.** Every DEX has different on-chain contract schemas—these must stay protocol-internal.

5. **Developer experience improves dramatically with abstraction.** Once implemented, developers write simpler, more maintainable code.

**The path forward:** Build a new generic layer that treats the current SDK as one protocol implementation among many. This preserves existing functionality while enabling multi-protocol support.

---

## File References

**All file paths referenced in this analysis:**

- `/packages/core/src/@types/queryprovider.ts` — Pool data structures
- `/packages/core/src/@types/configs.ts` — Swap/deposit/withdraw config interfaces
- `/packages/core/src/TxBuilders/TxBuilder.V3.class.ts` — V3 transaction builder
- `/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts` — Datum construction
- `/packages/core/src/QueryProviders/QueryProviderSundaeSwap.ts` — SundaeSwap API queries
- `/packages/core/src/Configs/SwapConfig.class.ts` — Swap configuration
- `/packages/core/src/Abstracts/TxBuilderAbstract.V3.class.ts` — Abstract builder base
- `/packages/core/src/Abstracts/QueryProvider.abstract.class.ts` — Query provider base
- `/packages/core/src/constants.ts` — Protocol constants and validators
- `/packages/core/src/SundaeSDK.class.ts` — Main SDK entry point
- `/packages/core/package.json` — Dependencies (Blaze, etc.)
- `/docs/guides/core/index.md` — Developer documentation

---

**End of Analysis**
