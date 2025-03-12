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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockBuild: Mock<any> = mock();
  // @ts-expect-error Type Mismatches.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockQuery: Mock<any> = mock(() => new MockedProviderSundaeSwap());
  const MockedSundaeSDK = mock().mockImplementation(() => ({
    build: mockBuild,
    swap: mockSwap,
    query: mockQuery,
  }));

  beforeEach(() => {
    MockedProviderSundaeSwap.mockClear();
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
};
