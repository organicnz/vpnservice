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
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off', // Allow 'any' type for Supabase responses
    '@typescript-eslint/consistent-type-imports': 'off',

    // Import rules
    'import/order': 'off',
    'import/prefer-default-export': 'off', // Named exports are better for tree-shaking

    // NextJS rules
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error', // Use next/image instead
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error
    'prefer-const': 'error', // Use const whenever possible
    'no-var': 'error', // Prefer let/const over var
    'eqeqeq': ['error', 'always'], // Require === and !==
    
    // Tailwind rules
    'tailwindcss/classnames-order': 'off',
    'tailwindcss/migration-from-tailwind-2': 'off',
    'tailwindcss/enforces-shorthand': 'off',
    
    // Accessibility rules
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off'
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