/**
 * ## Mocks
 * Some example descriptions for using exported mocks in your application.
 *
 * @module Mocks
 * @packageDescription
 */

import { jest } from "@jest/globals";

export const MockAll = () => {
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

  const MockedProviderSundaeSwap = jest.fn().mockImplementation(() => {
    return {
      findPoolData: jest.fn(() => "findPoolData"),
      findPoolIdent: jest.fn(() => "findPoolIdent"),
    };
  });
  const MockedTxBuilderLucid = jest.fn().mockImplementation(() => {
    return {};
  });

  const MockedDatumBuilderLucid = jest.fn().mockImplementation(() => {
    return {};
  });

  beforeEach(() => {
    MockedDatumBuilderLucid.mockClear();
    MockedProviderSundaeSwap.mockClear();
    MockedTxBuilderLucid.mockClear();
    MockedSundaeSDK.mockClear();
    mockSwap.mockClear();
    mockBuild.mockClear();
    mockQuery.mockClear();
  });

  jest.mock("@sundaeswap/core", () => ({
    ...(jest.requireActual("@sundaeswap/core") as any),
    SundaeSDK: MockedSundaeSDK,
    ProviderSundaeSwap: MockedProviderSundaeSwap,
  }));

  jest.mock("@sundaeswap/core/lucid", () => ({
    TxBuilderLucid: MockedTxBuilderLucid,
    DatumBuilderLucid: MockedDatumBuilderLucid,
  }));
};
