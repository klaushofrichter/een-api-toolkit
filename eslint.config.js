import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.cjs']
  },

  // Base JavaScript config
  js.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'vue': vue
    },
    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,

      // TypeScript custom rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Disable no-undef for TypeScript files - TypeScript handles this better
      'no-undef': 'off',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Vue files - use Vue 3 recommended config
  ...vue.configs['flat/recommended'],

  // Vue custom rules override
  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off'
    }
  },

  // Test files - allow console.log
  {
    files: ['**/__tests__/**', '**/e2e/**', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off'
    }
  }
]
