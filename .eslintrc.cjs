module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // Add prettier last to override other formatting rules
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error', // Enforce Prettier formatting
    '@typescript-eslint/no-unused-vars': 'warn', // More lenient for dev
    'prefer-const': 'warn', // More lenient for dev
    'no-console': 'warn', // Allow console.warn and .error
  },
};
