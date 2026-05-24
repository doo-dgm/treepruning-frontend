import { defineConfig, globalIgnores } from 'eslint/config'
import globals      from 'globals'
import js           from '@eslint/js'
import pluginVue    from 'eslint-plugin-vue'
import tsParser     from '@typescript-eslint/parser'
import tsPlugin     from '@typescript-eslint/eslint-plugin'

export default defineConfig([
  {
    name:  'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,ts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  {
    files: ['**/*.vue'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
])
