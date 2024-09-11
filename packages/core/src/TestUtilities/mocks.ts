/**
 * ## Mocks
 * Some example descriptions for using exported mocks in your application.
 *
 * @module Mocks
 * @packageDocumentation
 */

import { beforeEach, mock, type Mock } from "bun:test";
import * as Core from "../exports/core";

export const MockAll = () => {
  const mockSwap: Mock<any> = mock(async () => ({
    submit: mock(() => "hex"),
    cbor: "cbor",
  }));

  const MockedProviderSundaeSwap = mock().mockImplementation(() => {
    return {
      findPoolData: mock(() => "findPoolData"),
      findPoolIdent: mock(() => "findPoolIdent"),
    };
  });
  const MockedTxBuilderLucid = mock().mockImplementation(() => {
    return {};
  });

  const MockedDatumBuilderLucid = mock().mockImplementation(() => {
    return {};
  });

  const mockBuild: Mock<any> = mock();
  // @ts-expect-error Type Mismatches.
  const mockQuery: Mock<any> = mock(() => new MockedProviderSundaeSwap());
  const MockedSundaeSDK = mock().mockImplementation(() => ({
    build: mockBuild,
    swap: mockSwap,
    query: mockQuery,
  }));

  beforeEach(() => {
    MockedDatumBuilderLucid.mockClear();
    MockedProviderSundaeSwap.mockClear();
    MockedTxBuilderLucid.mockClear();
    MockedSundaeSDK.mockClear();
    mockSwap.mockClear();
    mockBuild.mockClear();
    mockQuery.mockClear();
  });

  mock.module("@sundaeswap/core", () => ({
    ...Core,
    SundaeSDK: MockedSundaeSDK,
    ProviderSundaeSwap: MockedProviderSundaeSwap,
  }));

  mock.module("@sundaeswap/core/lucid", () => ({
    TxBuilderLucid: MockedTxBuilderLucid,
    DatumBuilderLucid: MockedDatumBuilderLucid,
  }));
};
