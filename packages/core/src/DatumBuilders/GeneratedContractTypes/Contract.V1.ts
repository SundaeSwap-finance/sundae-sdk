/* eslint-disable */
// @ts-nocheck
import { Exact, Type } from "@blaze-cardano/data";

const Contracts = Type.Module({
  PaymentStakingHash: Type.Union([
    Type.Object({
      KeyHash: Type.Object(
        {
          keyHash: Type.String(),
        },
        { ctor: 0n },
      ),
    }),
    Type.Object({
      ScriptHash: Type.Object(
        {
          scriptHash: Type.String(),
        },
        { ctor: 1n },
      ),
    }),
  ]),
  Credential: Type.Object(
    {
      paymentKey: Type.Ref("PaymentStakingHash"),
      stakingKey: Type.Optional(
        Type.Object({ value: Type.Ref("PaymentStakingHash") }, { ctor: 0n }),
      ),
    },
    { ctor: 0n },
  ),
  Destination: Type.Object(
    {
      credentials: Type.Ref("Credential"),
      datum: Type.Optional(Type.String()),
    },
    { ctor: 0n },
  ),
  OrderAddresses: Type.Object(
    {
      destination: Type.Ref("Destination"),
      alternate: Type.Optional(Type.String()),
    },
    { ctor: 0n },
  ),
  SwapDirection: Type.Object(
    {
      suppliedAssetIndex: Type.Union([
        Type.Literal("A", { ctor: 0n }),
        Type.Literal("B", { ctor: 1n }),
      ]),
      amount: Type.BigInt(),
      minReceivable: Type.Optional(Type.BigInt()),
    },
    { ctor: 0n },
  ),
  DepositPair: Type.Object(
    {
      Child: Type.Object(
        {
          pair: Type.Object(
            {
              a: Type.BigInt(),
              b: Type.BigInt(),
            },
            { ctor: 0n },
          ),
        },
        { ctor: 1n },
      ),
    },
    { ctor: 2n },
  ),
  SwapOrder: Type.Object(
    {
      ident: Type.String(),
      orderAddresses: Type.Ref("OrderAddresses"),
      scooperFee: Type.BigInt(),
      swapDirection: Type.Ref("SwapDirection"),
    },
    { ctor: 0n },
  ),
  DepositOrder: Type.Object(
    {
      ident: Type.String(),
      orderAddresses: Type.Ref("OrderAddresses"),
      scooperFee: Type.BigInt(),
      DepositPair: Type.Ref("DepositPair"),
    },
    { ctor: 0n },
  ),
  WithdrawAsset: Type.Union([
    Type.Object(
      {
        value: Type.BigInt(),
      },
      { ctor: 1n },
    ),
  ]),
  WithdrawOrder: Type.Object(
    {
      ident: Type.String(),
      orderAddresses: Type.Ref("OrderAddresses"),
      scooperFee: Type.BigInt(),
      WithdrawAsset: Type.Ref("WithdrawAsset"),
    },
    { ctor: 0n },
  ),
});

export const PaymentStakingHash = Contracts.Import("PaymentStakingHash");
export type PaymentStakingHash = Exact<typeof PaymentStakingHash>;
export const Credential = Contracts.Import("Credential");
export type Credential = Exact<typeof Credential>;
export const Destination = Contracts.Import("Destination");
export type Destination = Exact<typeof Destination>;
export const OrderAddresses = Contracts.Import("OrderAddresses");
export type OrderAddresses = Exact<typeof OrderAddresses>;
export const SwapDirection = Contracts.Import("SwapDirection");
export type SwapDirection = Exact<typeof SwapDirection>;
export const DepositPair = Contracts.Import("DepositPair");
export type DepositPair = Exact<typeof DepositPair>;
export const SwapOrder = Contracts.Import("SwapOrder");
export type SwapOrder = Exact<typeof SwapOrder>;
export const DepositOrder = Contracts.Import("DepositOrder");
export type DepositOrder = Exact<typeof DepositOrder>;
export const WithdrawAsset = Contracts.Import("WithdrawAsset");
export type WithdrawAsset = Exact<typeof WithdrawAsset>;
export const WithdrawOrder = Contracts.Import("WithdrawOrder");
export type WithdrawOrder = Exact<typeof WithdrawOrder>;
