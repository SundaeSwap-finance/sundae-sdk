/**
 * ## Mocks
 * Some example descriptions for using exported mocks in your application.
 *
 * @module Mocks
 * @packageDescription
 */

import { jest } from "@jest/globals";

const MockedDatumBuilderLucid = jest.fn().mockImplementation(() => {
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

const MockCoreExports = () => {
  beforeEach(() => {
    MockedSundaeSDK.mockClear();
    mockSwap.mockClear();
    mockBuild.mockClear();
    mockQuery.mockClear();
  });

  jest.mock("@sundaeswap/core", () => ({
    SundaeSDK: MockedSundaeSDK,
  }));
};

const MockQueryProviderExports = () => {
  beforeEach(() => {
    MockedProviderSundaeSwap.mockClear();
  });

  jest.mock("@sundaeswap/core/extensions", () => ({
    ProviderSundaeSwap: MockedProviderSundaeSwap,
  }));
};

const MockExtensionExports = () => {
  beforeEach(() => {
    MockedDatumBuilderLucid.mockClear();
    MockedProviderSundaeSwap.mockClear();
    MockedTxBuilderLucid.mockClear();
  });

  jest.mock("@sundaeswap/core/extensions", () => ({
    DatumBuilderLucid: MockedDatumBuilderLucid,
    ProviderSundaeSwap: MockedProviderSundaeSwap,
    TxBuilderLucid: MockedTxBuilderLucid,
  }));
};

const MockAll = async () => {
  MockCoreExports();
  MockExtensionExports();
};

const SundaeSDK = {
  mockSwap,
  mockBuild,
  mockQuery,
};

export {
  MockAll,
  MockCoreExports,
  MockExtensionExports,
  MockQueryProviderExports,
  SundaeSDK,
};
