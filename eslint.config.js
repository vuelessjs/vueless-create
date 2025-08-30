import globals from "globals";
import { defineConfig } from "eslint/config";
import prettierEslintConfig from "@vue/eslint-config-prettier";

const languageOptions = {
  globals: {
    ...globals.node,
    ...globals.browser,
  },
  parserOptions: {
    module: "esnext",
  },
};

export default defineConfig([
  {
    name: "global",
    ignores: ["**/dist/**"],
    languageOptions,
  },
  prettierEslintConfig,
  {
    name: "common",
    languageOptions,
    files: ["**/*.js"],
    rules: {
      "no-console": process.env.PROD ? "error" : "warn",
      "no-debugger": process.env.PROD ? "error" : "warn",
      "no-unused-vars": process.env.PROD ? "error" : "warn",
      "no-unused-expressions": ["error", { allowTernary: true, allowShortCircuit: true }],
      "max-len": ["error", { code: 120, ignoreComments: true, ignoreUrls: true }],
      "arrow-parens": ["error", "always"],
      curly: ["error", "multi-line"],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: "directive", next: "*" },
        { blankLine: "any", prev: "directive", next: "directive" },
        { blankLine: "always", prev: "block-like", next: "*" },
        { blankLine: "always", prev: "*", next: "block-like" },
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "prettier/prettier": ["warn", { printWidth: 100 }],
    },
  },
  {
    name: "eslint",
    files: ["eslint.config.*"],
    rules: {
      "prettier/prettier": ["warn", { printWidth: 120 }],
    },
  },
]);
