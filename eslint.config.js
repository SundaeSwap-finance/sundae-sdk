import { configs } from "@sundaeswap/eslint-config";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...configs,
  {
    ignores: [
      "**/node_modules/**",
      "**/docs/**",
      "**/dist/**",
      "**/demo/**",
      "**/__tests__/**",
      "./packages/core/src/TestUtilities/*.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-expressions": "off",
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
