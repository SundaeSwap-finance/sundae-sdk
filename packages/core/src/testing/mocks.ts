/**
 * ## Mocks
 * Some example descriptions for using exported mocks in your application.
 *
 * @module Mocks
 * @packageDescription
 */

import { jest } from "@jest/globals";
import { AssetAmount } from "../classes/AssetAmount.class";

const MockedLucidDatumBuilder = jest.fn().mockImplementation(() => {
  return {};
});
const MockedProviderSundaeSwap = jest.fn().mockImplementation(() => {
  return {
    findPoolData: jest.fn(() => "findPoolData"),
    findPoolIdent: jest.fn(() => "findPoolIdent"),
  };
});
const MockedTxBuilderLucid = jest.fn().mockImplementation(() => {
  return {};
});

const mockSwap: any = jest.fn(async () => ({
  submit: jest.fn(() => "hex"),
  cbor: "cbor",
}));
const mockBuild: any = jest.fn();
const mockQuery: any = jest.fn(() => new MockedProviderSundaeSwap());
const MockedSundaeSDK = jest.fn().mockImplementation(() => ({
  build: mockBuild,
  swap: mockSwap,
  query: mockQuery,
}));

const MockExports = async () => {
  beforeEach(() => {
    MockedLucidDatumBuilder.mockClear();
    MockedProviderSundaeSwap.mockClear();
    MockedTxBuilderLucid.mockClear();
    MockedSundaeSDK.mockClear();
    mockSwap.mockClear();
  });

  jest.mock("@sundaeswap/sdk-core", () => ({
    SundaeSDK: MockedSundaeSDK,
    AssetAmount,
  }));
  jest.mock("@sundaeswap/sdk-core/extensions", () => ({
    LucidDatumBuilder: MockedLucidDatumBuilder,
    ProviderSundaeSwap: MockedProviderSundaeSwap,
    TxBuilderLucid: MockedTxBuilderLucid,
  }));
};

const SundaeSDK = {
  mockSwap,
  mockBuild,
  mockQuery,
};

export { MockExports, SundaeSDK };
