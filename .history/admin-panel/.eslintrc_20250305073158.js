module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    'react/jsx-props-no-spreading': 'off', // Allow JSX prop spreading
    'react/require-default-props': 'off', // TypeScript handles this

    // TypeScript rules
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Inferred return types are often clear
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn', // Discourage 'any' type but don't error
    '@typescript-eslint/consistent-type-imports': 'error',

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // Built-in imports (come from NodeJS)
          'external', // External imports
          'internal', // Absolute imports
          ['sibling', 'parent'], // Relative imports
          'index', // index imports
          'object', // Object imports
          'type', // Type imports
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/prefer-default-export': 'off', // Named exports are better for tree-shaking

    // NextJS rules
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error', // Use next/image instead
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
    'prefer-const': 'error', // Use const whenever possible
    'no-var': 'error', // Prefer let/const over var
    'eqeqeq': ['error', 'always'], // Require === and !==
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    tailwindcss: {
      callees: ['classnames', 'clsx', 'cn'],
      config: './tailwind.config.js',
    },
  },
}; 