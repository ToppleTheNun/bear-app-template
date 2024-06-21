// @ts-check

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintCommentsPlugin from "eslint-plugin-eslint-comments";
import importPlugin from "eslint-plugin-i";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import unicornPlugin from "eslint-plugin-unicorn";
import vitestPlugin from "eslint-plugin-vitest";
import globals from "globals";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default tseslint.config(
  // Register plugins up front
  {
    plugins: {
      ["@typescript-eslint"]: tseslint.plugin,
      ["eslint-comments"]: eslintCommentsPlugin,
      ["import"]: importPlugin,
      ["jsx-a11y"]: jsxA11yPlugin,
      ["react-hooks"]: reactHooksPlugin,
      ["react"]: reactPlugin,
      ["simple-import-sort"]: simpleImportSortPlugin,
      ["unicorn"]: unicornPlugin,
      ["test"]: vitestPlugin,
    },
  },
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: [
      "**/node_modules",
      "**/build",
      "**/dist",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/pnpm-lock.yaml",
      "**/bun.lockb",

      "**/output",
      "**/coverage",
      "**/temp",
      "**/.temp",
      "**/tmp",
      "**/.tmp",
      "**/.history",
      "**/.vitepress/cache",
      "**/.nuxt",
      "**/.next",
      "**/.vercel",
      "**/.changeset",
      "**/.idea",
      "**/.cache",
      "**/.output",
      "**/.vite-inspect",

      "**/CHANGELOG*.md",
      "**/*.min.*",
      "**/LICENSE*",
      "**/__snapshots__",
      "**/auto-import?(s).d.ts",
      "**/components.d.ts",
    ],
  },

  // extends ...
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // base config
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        document: "readonly",
        navigator: "readonly",
        window: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2022,
        sourceType: "module",
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      //
      // eslint-plugin-eslint-comment
      //

      // require a eslint-enable comment for every eslint-disable comment
      "eslint-comments/disable-enable-pair": [
        "error",
        {
          allowWholeFile: true,
        },
      ],
      // disallow a eslint-enable comment for multiple eslint-disable comments
      "eslint-comments/no-aggregating-enable": "error",
      // disallow duplicate eslint-disable comments
      "eslint-comments/no-duplicate-disable": "error",
      // disallow eslint-disable comments without rule names
      "eslint-comments/no-unlimited-disable": "error",
      // disallow unused eslint-disable comments
      "eslint-comments/no-unused-disable": "error",
      // disallow unused eslint-enable comments
      "eslint-comments/no-unused-enable": "error",
      // disallow ESLint directive-comments
      "eslint-comments/no-use": [
        "error",
        {
          allow: [
            "eslint-disable",
            "eslint-disable-line",
            "eslint-disable-next-line",
            "eslint-enable",
            "global",
          ],
        },
      ],

      //
      // eslint-plugin-import
      //

      // disallow non-import statements appearing before import statements
      "import/first": "error",
      // Require a newline after the last import/require in a group
      "import/newline-after-import": "error",
      // Forbid import of modules using absolute paths
      "import/no-absolute-path": "error",
      // disallow AMD require/define
      "import/no-amd": "error",
      // forbid default exports - we want to standardize on named exports so that imported names are consistent
      "import/no-default-export": "error",
      // disallow imports from duplicate paths
      "import/no-duplicates": "error",
      // Forbid the use of extraneous packages
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
          peerDependencies: true,
          optionalDependencies: false,
        },
      ],
      // Forbid mutable exports
      "import/no-mutable-exports": "error",
      // Prevent importing the default as if it were named
      "import/no-named-default": "error",
      // Prohibit named exports
      "import/no-named-export": "off", // we want everything to be a named export
      // Forbid a module from importing itself
      "import/no-self-import": "error",
      // Require modules with a single export to use a default export
      "import/prefer-default-export": "off", // we want everything to be named

      // enforce a sort order across the codebase
      "simple-import-sort/imports": "error",

      // consistent type imports
      "@typescript-eslint/consistent-type-assertions": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
    },
    settings: {
      "import/internal-regex": "^~/",
    },
  },

  // disable type checking for the few JS files we have...
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      // turn off other type-aware rules
      "deprecation/deprecation": "off",
      "@typescript-eslint/internal/no-poorly-typed-ts-props": "off",

      // turn off rules that don't apply to JS code
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  //
  // test file linting
  //

  // define the vitest globals for all test files
  {
    files: [
      "**/__tests__/**/*.?([cm])[jt]s?(x)",
      "**/*.spec.?([cm])[jt]s?(x)",
      "**/*.test.?([cm])[jt]s?(x)",
      "**/*.bench.?([cm])[jt]s?(x)",
      "**/*.benchmark.?([cm])[jt]s?(x)",
    ],
    languageOptions: {
      globals: {
        ...vitestPlugin.environments.env.globals,
      },
    },
  },
  // test file specific configuration
  {
    files: [
      "**/__tests__/**/*.?([cm])[jt]s?(x)",
      "**/*.spec.?([cm])[jt]s?(x)",
      "**/*.test.?([cm])[jt]s?(x)",
      "**/*.bench.?([cm])[jt]s?(x)",
      "**/*.benchmark.?([cm])[jt]s?(x)",
    ],
    rules: {
      "test/expect-expect": "error",
      "test/no-commented-out-tests": "error",
      "test/no-identical-title": "error",
      "test/no-import-node-test": "error",
      "test/require-local-test-context-for-concurrent-snapshots": "error",
      "test/valid-describe-callback": "error",
      "test/valid-expect": "error",
      "test/valid-title": "error",
    },
  },

  //
  // tools and tests
  //
  {
    files: [
      "**/__tests__/**/*.?([cm])[jt]s?(x)",
      "**/*.spec.?([cm])[jt]s?(x)",
      "**/*.test.?([cm])[jt]s?(x)",
      "**/*.bench.?([cm])[jt]s?(x)",
      "**/*.benchmark.?([cm])[jt]s?(x)",
      "other/**/*.?([cm])[jt]s?(x)",
    ],
    rules: {
      // allow console logs in other and tests
      "no-console": "off",
      // also allow empty functions
      "@typescript-eslint/no-empty-function": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: [
      "eslint.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "vite.config.ts",
      "app/root.tsx",
      "app/entry.server.tsx",
      "app/routes/*.tsx",
      "other/**/*.ts",
    ],
    rules: {
      // requirement
      "import/no-default-export": "off",
    },
  },

  //
  // react
  //
  {
    files: ["**/*.{ts,tsx,mts,cts,js,jsx}"],
    extends: [
      ...compat.config(jsxA11yPlugin.configs.recommended),
      ...compat.config(reactPlugin.configs.recommended),
      ...compat.config(reactPlugin.configs["jsx-runtime"]),
      ...compat.config(reactHooksPlugin.configs.recommended),
    ],
    settings: {
      react: {
        version: "detect",
      },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react/jsx-no-undef": "off",
      "react/prop-types": "off",
    },
  },
);
