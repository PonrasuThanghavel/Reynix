const js = require("@eslint/js");
const globals = require("globals");
const jsdoc = require("eslint-plugin-jsdoc");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  jsdoc.configs["flat/recommended"],
  {
    plugins: {
      jsdoc: jsdoc,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "error",
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
      "jsdoc/require-description": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
    },
  },
  prettierConfig,
];
