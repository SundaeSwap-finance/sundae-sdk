import { JestConfigWithTsJest } from "ts-jest";

export const baseConfig = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist", "node_modules", "__tests__/data"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          target: "esnext",
          module: "esnext",
        },
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!@sundaeswap/cpp|@sundaeswap/asset|@sundaeswap/fraction|@sundaeswap/bigint-math)",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^lucid-cardano$": "<rootDir>/node_modules/lucid-cardano",
  },
};

const config: JestConfigWithTsJest = {
  projects: [
    // @ts-ignore Annoying type overloads.
    {
      displayName: "core",
      testMatch: ["<rootDir>/packages/core/*/**/__tests__/**/*.test.*?(x)"],
      ...baseConfig,
    },
    // @ts-ignore Annoying type overloads.
    {
      displayName: "taste-test",
      testMatch: [
        "<rootDir>/packages/taste-test/*/**/__tests__/**/*.test.*?(x)",
      ],
      ...baseConfig,
    },
    // @ts-ignore Annoying type overloads.
    {
      displayName: "yield-farming",
      testMatch: [
        "<rootDir>/packages/yield-farming/*/**/__tests__/**/*.test.*?(x)",
      ],
      ...baseConfig,
    },
    // @ts-ignore Annoying type overloads.
    {
      displayName: "gummiworm",
      testMatch: [
        "<rootDir>/packages/gummiworm/*/**/__tests__/**/*.test.*?(x)",
      ],
      ...baseConfig,
    },
  ],
};

export default config;
