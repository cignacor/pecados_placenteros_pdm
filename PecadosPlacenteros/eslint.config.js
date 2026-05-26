// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,

  {
    // Reglas personalizadas para Pecados Placenteros
    rules: {
      // ── Calidad de código ──────────────────────────────────────────────
      'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-var': 'error',
      'prefer-const': ['warn', { destructuring: 'all' }],

      // ── React ──────────────────────────────────────────────────────────
      'react/prop-types': 'off',           // Usamos TypeScript para tipos
      'react/display-name': 'warn',
      'react/no-unused-state': 'warn',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'off',       // No necesario con React 17+
      'react/react-in-jsx-scope': 'off',   // No necesario con React 17+
      'react/self-closing-comp': ['warn', { component: true, html: false }],

      // ── React Hooks ────────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── Estilo / formato ───────────────────────────────────────────────
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['warn', 'multi-line'],
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'comma-dangle': ['warn', 'always-multiline'],
      'object-shorthand': ['warn', 'always'],
      'arrow-body-style': ['warn', 'as-needed'],
    },
  },

  {
    // Ignorar carpetas generadas / dependencias
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'coverage/*',
      '**/*.generated.*',
    ],
  },
]);
