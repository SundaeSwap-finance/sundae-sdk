/** @type {import('jest').Config} */
module.exports = {
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
  // testEnvironment: "node",
  // extensionsToTreatAsEsm: [".ts"],
  // globals: {
  //   "ts-jest": {
  //     useESM: true,
  //   }
  // },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/src/__tests__/data/"]
};
