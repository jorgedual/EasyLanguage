const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['out/**', 'node_modules/**', 'coverage/**', '*.js', '.husky/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  }
);
