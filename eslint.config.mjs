import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import licenseHeader from "eslint-plugin-license-header";

export default tseslint.config(
  {
    ignores: ["**/node_modules", "**/build", "**/.next", "**/.turbo", "**/coverage", "**/vendor", "**/wasm", "**/next-env.d.ts"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "license-header": licenseHeader,
    },
    rules: {
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-non-null-assertion": ["error"],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "allow",
        },
      ],
      "license-header/header": [
      "error",
      [
          `/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */`
      ]
    ],
      "jsx-quotes": ["error", "prefer-double"],
      "quote-props": ["error", "as-needed"],
      "object-shorthand": ["error", "always"],
      "no-unused-vars": "off",
      "no-unused-imports": "off",
      "no-var": ["error"],
      "no-console": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  },
  // Next.js specific configuration
  {
    files: ["examples/avatar-preview-app/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
    settings: {
      next: {
        rootDir: ["./examples/avatar-preview-app/"],
      },
    },
  },
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
