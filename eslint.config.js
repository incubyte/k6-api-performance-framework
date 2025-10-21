import prettierConfig from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        open: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-undef": "warn",
      "no-redeclare": "error",
      indent: "off",
      "implicit-arrow-linebreak": "off",
      quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      "linebreak-style": ["error", "unix"],
    },
  },

  prettierConfig,
  eslintPluginPrettier,
];
