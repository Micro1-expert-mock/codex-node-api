module.exports = [
  {
    ignores: ['node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        Buffer: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        expect: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        test: 'readonly',
      },
    },
    rules: {
      'max-len': ['error', { code: 100 }],
      'no-console': 'error',
    },
  },
];
