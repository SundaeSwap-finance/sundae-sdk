import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  projects: [
    {
      displayName: "@sundaeswap/sdk-core",
      testEnvironment: "node",
      testMatch: ["<rootDir>/packages/core/**/__tests__/**/*.test.*?(x)"],
      testPathIgnorePatterns: ["/dist/", "/node_modules/", "__tests__/data"],
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
        "node_modules/(?!lucid-cardano|@sundaeswap/cpp|@sundaeswap/asset|@sundaeswap/fraction|@sundaeswap/bigint-math)",
      ],
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^lucid-cardano$": "<rootDir>/node_modules/lucid-cardano",
      },
    },
  ],
};

export default config;
