module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-native', 'eslint-plugin-react-hooks', 'jest'],
  parserOptions: {
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  extends: [
    'react-native',
    'airbnb',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        useTabs: false,
        semi: true,
        arrowParens: 'avoid',
        jsxBracketSameLine: false,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    '@typescript-eslint/no-explicit-any': 0,
    'no-console': 2,
    'import/prefer-default-export': 0,
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.tsx'] }],
    'react/jsx-props-no-spreading': 0,
    'react/static-property-placement': ['error', 'static public field'],
    '@typescript-eslint/explicit-function-return-type': 0,
    'import/no-default-export': 2,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/camelcase': 0,
    '@typescript-eslint/no-empty-function': 0,
    'no-unused-expressions': 0,
    'react/require-default-props': 0,
  },
  globals: {
    fetch: false,
  },
};
