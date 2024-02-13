---
title: Overview
nav_order: 1
---

# Overview

This repository handles all Typescript SDK packages for interacting directly with the SundaeSwap Protocol. 

## Problem

Building transactions in Cardano, especially when working with smart contracts, is a high-risk operation. Specifically when dealing
with smart contracts, it is possible for funds to be "bricked" if corresponding datums (transaction state), are malformed and do not
conform to the smart contract spec. This means that ADA and other tokens can be lost **forever** with no possible way to retrieve it.

## Solution

To minimize this and encourage cross-ecosystem adoption of SundaeSwap ecosystem protocols, we decided to build an end-to-end tested
SDK in TypeScript that ensures datum compliance with corresponding smart contract versions.

## Requirements

All SDKs are built to be extendable, but currently we only support transaction building using [Lucid](https://www.npmjs.com/package/lucid-cardano). This means that they
require bundling using a tool like [Webpack](https://webpack.js.org/) with WASM support. As a sample, you'll want to configure you Webpack like this:

### Loading WASM Asynchronously

```ts
const config = {
    ...args,
    experiments: {
      topLevelAwait: true,
      asyncWebAssembly: true,
    },
}
```

### Loading WASM Synchronously

```ts
const config = {
    ...args,
    experiments: {
      layers: true,
      syncWebAssembly: true,
    },
}
```

### Browserfy Buffer

All Lucid exports in the SDKs require Buffer to work in the browser. To enable this in Webpack, do the following:

```ts
const config = {
  ...args,
  plugins: {
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    });
  }
}
```

## Up Next: [Getting Started](./guides)