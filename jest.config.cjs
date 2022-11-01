const jestConfig = require("@sundae/jest-config");

/** @type {import('jest').Config} */
module.exports = {
  ...jestConfig,
  transform: {},
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    }
  },
  testPathIgnorePatterns: ["<rootDir>/dist/"],
};
