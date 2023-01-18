/** @type {import('jest').Config} */
module.exports = {
  roots: [
    "<rootDir>/src/"
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        useESM: true
      }
    ],
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/__tests__/data/"]
};
