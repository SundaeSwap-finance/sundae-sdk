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

The SundaeSwap SDK is built on top of the popular transaction building library, Blaze, an open-source library that we also help maintain. You must install this dependency in your project along with whatever SundaeSwap SDK libary you are trying to use.

- [Blaze](https://github.com/butaneprotocol/blaze-cardano)

## Up Next: [Getting Started](./guides)
